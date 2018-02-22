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

// require('dotenv').config({ silent: true });

// var cfenv = require('cfenv');
// app.use(express.static(__dirname + '/public'));

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// start server on the specified port and binding host
app.listen(process.env.PORT || 5000);

var infoUsuario = null;
var contexto_atual = null;

// remover isso aki
app.get("/", function (req, res) {
    res.send("Deployed!");
});

//---------------------Firebase-----------------------------
function writeFirebase(results, sender, payld) {
    if (infoUsuario  == null) getUserName(sender);
    
    firebase.salvarPedidos(admin, results, userInfo, payld)

    // if (userDataFacebook == null) {
    //     FB.api('me', function (res) {
    //         if (!res || res.error) {
    //             console.log(!res ? 'error occurred' : res.error);
    //             return;
    //         }
    //         firebase.salvarPedidos(admin, results, res, payld);//rever isso aki---------------------
    //         userDataFacebook = res;
    //     });
    // } else {
    //     firebase.salvarPedidos(admin, results, userDataFacebook, payld);//rever isso aki---------------------
    // }
}

//---------------------Watson------------------------------
var w_conversation = new Conversation({
    url: 'https://gateway.watsonplatform.net/conversation/api',
    version_date: '2017-04-21',
    username: process.env.CONVERSATION_USERNAME,
    password: process.env.CONVERSATION_PASSWORD,
    version: 'v1'
});

function callWatson(payload, sender) {
    w_conversation.message(payload, function (err, results) {

        if (err) return responseToRequest.send("Erro > " + JSON.stringify(err));

        if (results.context != null) contexto_atual = results.context;

        if (results != null && results.output != null) {
            var i = 0;
            while (i < results.output.text.length) {
                sendMessage(sender, results.output.text[i++]);
            }
        }
        writeFirebase(results, sender, payload);//rever isso aki
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

        if (event.message && event.message.text) text = event.message.text;
        else if (event.postback && !text) text = event.postback.payload;
        else break;

        var payload = {
            workspace_id: process.env.WORKSPACE_ID,
            context: contexto_atual || {},
            input: { "text": text },
            alternate_intents: true
        };

        callWatson(payload, sender);
    }
    res.sendStatus(200);
});

function sendMessage(sender, text_) {
    text_ = text_.substring(0, 319);
//--------------------------------------------------------------------------------------
// Remover
    let messageDt = {
	    "attachment": {
		    "type": "template",
		    "payload": {
				"template_type": "generic",
			    "elements": [{
					"title": "Mussarela",
				    "subtitle": "hoje estou só testando",
				    "image_url": "https://goo.gl/N2Wb4t",
				    "buttons": [{
					    "type": "web_url",
					    "url": "https://www.messenger.com",
					    "title": "web url"
				    }, {
					    "type": "postback",
					    "title": "Mussarela",
					    "payload": "Payload for first element in a generic bubble",
				    }],
			    }, {
				    "title": "Second card",
				    "subtitle": "Element #2 of an hscroll",
				    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
				    "buttons": [{
					    "type": "postback",
					    "title": "Postback",
					    "payload": "Payload for second element in a generic bubble",
				    }],
			    }]
		    }
	    }
    }
    messageData = messageDt;
    console.log({ text: text_ });//remover-------------
//---------------------------------------------------------------
//    messageData = { text: text_ };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FB_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
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

//testando

function getUserName(sender) {
    var userInfo = null
    var usersPublicProfile = 'https://graph.facebook.com/v2.6/' + sender + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + process.env.FB_TOKEN;
    request({
        url: usersPublicProfile,
        json: true // parse
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
                userInfo = body;
        }
    });
    return userInfo;
};