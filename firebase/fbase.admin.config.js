var establishmentID = 'FtGtribEX9Zp0OvTAHPOwhefM';
// var facebookIdPage = '1581467655294794';

const connectToFirebase = () => {
  var admin = require("firebase-admin");
  var serviceAccount = require("./serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pizza-ordering-demo.firebaseio.com"
  });
  return admin;
}

const salvarPedidos = (admin, respostaWatson, userInfo, payld) => {
  var db = admin.database();

  if (respostaWatson != null) {
    var id = respostaWatson.context.conversation_id;
    db.ref("establishments/" + establishmentID + "/pedidos/" + id).set({
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

  db.ref("establishments/" + establishmentID + "/clientes/" + id).set({
    last_context_dialog: contextWatson,
    dataUser: userInfo,
    history_order: '',
    last_order: ''
  });
}

const getUserInfoInFirebase = (admin, idUser, callBack) => {
  var db = admin.database();

  db.ref("establishments/" + establishmentID + "/clientes/" + idUser + "/last_context_dialog").once("value", (snapshot) => {
    console.log("InfoUserBaixado");
    console.log(snapshot.val());
    
    callBack(snapshot.val())
  }, (errorObject)=>{
    console.log("InfoUser Não Baixado - Erro");
    console.log(errorObject.code);
  });
}

const getCardapioFirebase = (admin) => {
  var db = admin.database();

  db.ref("establishments/" + establishmentID + "/cardapio/").once("value", (snapshot) => {
    console.log("InfoUserBaixado");
    console.log(snapshot.val());
  }, (errorObject)=>{
    console.log("InfoUser Não Baixado - Erro");
    console.log(errorObject.code);
  });
}

// const getEstablishmentTokenInFirebase = (facebookPageToken) => {
//   var db = admin.database();

//   db.ref("/webhook/" + facebookPageToken).once("value", (snapshot) => {
//     console.log("InfoUserBaixado");
//     console.log(snapshot.val().establishmentID);
    
//     // callBack(snapshot.val())
//   }, (errorObject)=>{
//     console.log("InfoUser Não Baixado - Erro");
//     console.log(errorObject.code);
//   });
// }

module.exports = {
  connectToFirebase,
  salvarPedidos,
  setUserInfoInFirebase,
  getUserInfoInFirebase,
  getCardapioFirebase
}