var establishmentID = 'FtGtribEX9Zp0OvTAHPOwhefM';

const connectToFirebase = () => {
  var admin = require("firebase-admin");
  var serviceAccount = require("./serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rodolpho-chatbot.firebaseio.com"
  });
  return admin;
}

const salvarLogsSistema = (admin, respostaWatson, userInfo, payld) => {
  var db = admin.database();
  var data = new Date();
  var dataNow = data.getDate + '-' + data.getMonth + '-' + data.getFullYear

  if (respostaWatson != null) {
    var id = respostaWatson.context.conversation_id;
    db.ref("logs/" + dataNow + "/" + id).set({
      Data: respostaWatson,
      Status: "Pendente",
      Address: "",
      userData: userInfo,
      PayLD: payld
    });
  }
}

const setUserInfoInFirebase = (admin, userInfo, contextWatson) => {
  var db = admin.database();
  var id = userInfo.id;

  db.ref("users/" + id).set({
    last_context_dialog: contextWatson,
    dataUser: userInfo,
    history_order: '',
    last_order: ''
  });
}

const getUserInfoInFirebase = (admin, idUser, callBack) => {
  var db = admin.database();

  db.ref("users/" + idUser + "/last_context_dialog").once("value", (snapshot) => {
    console.log("Informações do Usuário Atualizadas");
    // console.log(snapshot.val());
    
    callBack(snapshot.val());
  }, (errorObject)=>{
    console.log("InfoUser Não Baixado - Erro");
    console.log(errorObject.code);
  });
}

module.exports = {
  connectToFirebase,
  salvarLogsSistema,
  setUserInfoInFirebase,
  getUserInfoInFirebase,
}