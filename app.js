/*eslint-env node*/

/**
 * Importando o módulo do firebase e inicializando o usuário
 * Inicializando configurações do Facebook
 */
var firebase = require('./firebase/fbase.admin.config.js')
var admin = firebase.connectToFirebase();
var FB = require('fb');
FB.setAccessToken(process.env.FB_TOKEN);

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var Conversation = require('watson-developer-cloud/conversation/v1');

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
// start server on the specified port and binding host
app.listen(process.env.PORT || 5000, () => console.log('webhook está ouvindo'));

var infoUsuario = null;
var contexto_atual = null;

var cardapio = null; // variável que contém o cardápio do estabelecimento;

// remover isso aki
app.get("/", function (req, res) {
    res.send("Deployed!");
});

//---------------------Firebase-----------------------------
function writeDataInFirebase(results, payld) {
    // salvar os pedidos dos usuários
    firebase.salvarPedidos(admin, results, infoUsuario, payld);

    // salvar contexto da conversa e info usuário no firebase
    firebase.setUserInfoInFirebase(admin, infoUsuario, contexto_atual);
}

function readDataInFirebase(sender) {
    // buscar contexto da conversa no firebase
    firebase.getUserInfoInFirebase(admin, sender, (context) => {
        contexto_atual = context;
    });

    // buscar cardápio no firebase;
    if (cardapio == null) {
        firebase.getCardapioFirebase(admin, (novoCardapio) => {
            cardapio = novoCardapio;
            console.log('Cardápio Atualizado');
        });
    }
}
//---------------------Watson------------------------------
var w_conversation = new Conversation({
    url: 'https://gateway.watsonplatform.net/conversation/api',
    version_date: '2017-04-21',
    username: process.env.CONVERSATION_USERNAME,
    password: process.env.CONVERSATION_PASSWORD,
    version: 'v1'
});

function callWatson(text, sender) {
    console.log("Entrei em callWatson");

    var payload = {
        workspace_id: process.env.WORKSPACE_ID,
        context: contexto_atual || {
            "nomeUser": infoUsuario.first_name
        }, //rever isso aki-------------
        input: {
            "text": text
        },
        alternate_intents: true
    };

    w_conversation.message(payload, function (err, results) {

        if (err) return responseToRequest.send("Erro > " + JSON.stringify(err));

        if (results.context != null) contexto_atual = results.context;

        if (results != null && results.output != null) {
            var i = 0;
            while (i < results.output.text.length) {
               
                console.log("\n Intenção: " + results.intents[0].intent + "\n"); //remover

                //enviando respostas personalizadas
                if (results.intents[0].intent == "pedir_pizza") {
                    buildCardsProdutos(sender, 'Pizza');
                    break;
                } else if (results.intents[0].intent == "ver_foto") {
                    sendImageMessage(sender);
                    break;
                } else if (results.intents[0].intent == "menu") {
                    buildTextMessage(sender, results.output.text[i++]);
                    buildCardsMenu(sender);
                    break;
                } else buildTextMessage(sender, results.output.text[i++]);
            }
        }
        writeDataInFirebase(results, payload); //Escrever informações no banco de dados
    });
}

//---------------------Facebook-----------------------------

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.FB_TOKENVERIFIC)
        res.send(req.query['hub.challenge']);
    res.send('Erro de validação no token.');
});

app.post('/webhook/', (req, res) => {
    var text = null;

    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;

        sendTypingOn(sender); // sinalização de que o bot está digitando

        if (event.message && event.message.text)
            text = event.message.text;

        else if (event.postback && !text) {
            text = event.postback.payload;
            var flag = false;

            switch (event.postback.title) {
                case 'Ver Produtos':
                    buildCardsProdutos(sender, text);
                    flag = true;
                    break;

                default:
                    break;
            }
            sendMessage(sender, {
                text: 'Você escolheu ' + text// remover -------------
            });
            if (flag) break; // parar a execução em situações específicas
        } else break;


        // retirar o setTimeout, estudar formas de retirá-lo

        if (infoUsuario == null || sender != infoUsuario.id) {
            getUserInfo(sender);

            readDataInFirebase(sender); // Buscar contexto da conversa

            setTimeout(() => {

                console.log("Contexto Atualizado");
                callWatson(text, sender);
            }, 1500);
        } else callWatson(text, sender) //pegar as informações do usuário
    }
    res.sendStatus(200);
});

//------------------------------ Facebook API Graph ----------------------------------------

function sendMessage(sender, messageData) {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: process.env.FB_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Erro no envio da mensagem ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

function getUserInfo(sender) {
    var usersPublicProfile = 'https://graph.facebook.com/v2.6/' + sender + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + process.env.FB_TOKEN;
    request({
        url: usersPublicProfile,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            infoUsuario = body;
        }
    });
};

function buildTextMessage(sender, text_) {
    text_ = text_.substring(0, 319);

    sendMessage(sender, {
        text: text_
    });
}

function buildCardsMenu(sender) {
    var elements = [];

    Object.keys(cardapio).forEach(element => {

        var aux = {
            "title": element,
            "subtitle": "Escolha essa opção para " + element + ".",
            "image_url": "https://goo.gl/gy85bR",
            "buttons": [{
                "type": "postback",
                "title": "Ver Produtos",
                "payload": element,
            }]
        };
        elements.push(aux);
    });

    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
    sendMessage(sender, messageData);
}

function buildCardsProdutos(sender, categoria) {
    var elements = [];

    for (var [key, value] of Object.entries(cardapio[categoria])) {

        if (value.manageProductStock == 'Sim'){

            var aux = {
                "title": key,
                "subtitle": "R$ " + value.price,
                "image_url": value.productImage,
                "buttons": [{
                    "type": "postback",
                    "title": "Voltar ao Menu",
                    "payload": 'Menu',
                    },
                    {
                    "type": "postback",
                    "title": "Ver Detalhes",
                    "payload": 'Ver Detalhes',
                    },
                    {
                    "type": "postback",
                    "title": "Adicionar",
                    "payload": key,
                    }]
            };
            elements.push(aux);
        }
    }

    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": elements
            }
        }
    };
    sendMessage(sender, messageData);
}

function buildCardMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Mussarela",
                    "subtitle": "hoje estou só testando",
                    "image_url": "https://goo.gl/N2Wb4t",
                    "buttons": [{
                        "type": "postback",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Mussarela",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }]
            }
        }
    }
    sendMessage(sender, messageData);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(sender) {
    var messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": infoUsuario.profile_pic
            }
        }
    }
    sendMessage(sender, messageData);
};

/*
 * Send a button message using the Send API.
 *
 */
function buildButtonMessage(recipientId, text, buttons) {
    var messageData = {
        attachment: {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": text,
                "buttons": buttons
            }
        }
    }
};
/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(sender) {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: process.env.FB_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            sender_action: "typing_on",
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Erro no envio da mensagem ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}