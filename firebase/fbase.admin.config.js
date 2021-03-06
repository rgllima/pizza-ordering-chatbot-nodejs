var establishmentID = 'FtGtribEX9Zp0OvTAHPOwhefM';

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
    console.log("Informações do Usuário Atualizadas");
    // console.log(snapshot.val());
    
    callBack(snapshot.val());
  }, (errorObject)=>{
    console.log("InfoUser Não Baixado - Erro");
    console.log(errorObject.code);
  });
}

const getCardapioFirebase = (admin, callBack) => {
  var db = admin.database();
  console.log("\n\nBaixando informações do cardápio pela 1ª Vez\n\n");

  db.ref("establishments/" + establishmentID + "/cardapio/").on("value", (snapshot) => {
    
    callBack(snapshot.val());
  });
};

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