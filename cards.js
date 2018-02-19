// // Atualize a API do webhook para procurar mensagens especiais para acionar os cartões
// // O que acontece quando o usuário clica em um botão ou cartão de mensagem? Vamos atualizar a API do webhook mais uma vez para enviar uma função de retorno
// // Para enviar mnsagens com cards


// app.post('/webhook/', function (req, res) {
//     let messaging_events = req.body.entry[0].messaging
//     for (let i = 0; i < messaging_events.length; i++) {
//       let event = req.body.entry[0].messaging[i]
//       let sender = event.sender.id

//       if (event.message && event.message.text) {
//   	    let text = event.message.text
//   	    if (text === 'Generic') {
//   		    sendGenericMessage(sender)
//   		    continue
//   	    }
//   	    sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
//       }
//       if (event.postback) {
//   	    let text = JSON.stringify(event.postback)
//   	    sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
//   	    continue
//       }
//     }
//     res.sendStatus(200)
//   });

// function sendGenericMessage(sender) {
//     let messageData = {
// 	    "attachment": {
// 		    "type": "template",
// 		    "payload": {
// 				"template_type": "generic",
// 			    "elements": [{
// 					"title": "First card",
// 				    "subtitle": "Element #1 of an hscroll",
// 				    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
// 				    "buttons": [{
// 					    "type": "web_url",
// 					    "url": "https://www.messenger.com",
// 					    "title": "web url"
// 				    }, {
// 					    "type": "postback",
// 					    "title": "Postback",
// 					    "payload": "Payload for first element in a generic bubble",
// 				    }],
// 			    }, {
// 				    "title": "Second card",
// 				    "subtitle": "Element #2 of an hscroll",
// 				    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
// 				    "buttons": [{
// 					    "type": "postback",
// 					    "title": "Postback",
// 					    "payload": "Payload for second element in a generic bubble",
// 				    }],
// 			    }]
// 		    }
// 	    }
//     }
//     request({
// 	    url: 'https://graph.facebook.com/v2.6/me/messages',
// 	    qs: {access_token:token},
// 	    method: 'POST',
// 	    json: {
// 		    recipient: {id:sender},
// 		    message: messageData,
// 	    }
//     }, function(error, response, body) {
// 	    if (error) {
// 		    console.log('Error sending messages: ', error)
// 	    } else if (response.body.error) {
// 		    console.log('Error: ', response.body.error)
// 	    }
//     })
// }