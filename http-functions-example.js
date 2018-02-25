/*
 * Essa função envia uma POST para registrar o Botão Começar (getStarted)
 * 
 */
(function() {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: {
            access_token: process.env.FB_TOKEN
        },
        method: 'POST',
        json: {
            "get_started":{
                "payload":"<GET_STARTED_PAYLOAD>"
            }
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Erro no envio da mensagem ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}())