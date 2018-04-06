var request = require('request');

const sendMessage = (sender, messageData) => {

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

const getUserInfo = (sender) => {
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

const buildTextMessage = (sender, text_) => {
    text_ = text_.substring(0, 319);

    sendMessage(sender, {
        text: text_
    });
}

const buildButtonMessage = (sender, text) => {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: text,
        buttons: [
          {
            type: "postback",
            title: "<BUTTON_TEXT>",
            payload: "<STRING_SENT_TO_WEBHOOK>"
          }
        ]
      }
    }
  };
  sendMessage(sender, messageData);
};

module.exports = {
  sendMessage,
  getUserInfo,
  buildTextMessage,
  buildButtonMessage
};

//   /*
//  * Send an image using the Send API.
//  *
//  */
// function sendImageMessage(sender) {
//     var messageData = {
//         "attachment": {
//             "type": "image",
//             "payload": {
//                 "url": infoUsuario.profile_pic
//             }
//         }
//     }
//     sendMessage(sender, messageData);
// };

// /*
//  * Turn typing indicator on
//  *
//  */
// function sendTypingOn(sender) {

//     request({
//         url: 'https://graph.facebook.com/v2.6/me/messages',
//         qs: {
//             access_token: process.env.FB_TOKEN
//         },
//         method: 'POST',
//         json: {
//             recipient: {
//                 id: sender
//             },
//             sender_action: "typing_on",
//         }
//     }, function (error, response, body) {
//         if (error) {
//             console.log('Erro no envio da mensagem ', error);
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error);
//         }
//     });
// }
