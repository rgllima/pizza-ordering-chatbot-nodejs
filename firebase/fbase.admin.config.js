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
    db.ref("/pedidos/" + id).set({
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

  db.ref("/clientes/" + id).set({
    last_context_dialog: contextWatson,
    dataUser: userInfo,
    history_order: '',
    last_order: ''
  });
}

const getUserInfoInFirebase = (admin, idUser) => {
  var db = admin.database();

  db.ref("/clientes/" + idUser + "/last_context_dialog").once("value", (snapshot)=> {
    console.log("InfoUserBaixado");
    console.log(snapshot.val());
    
    return JSON.stringfy(snapshot.val());
  }, (errorObject)=>{
    console.log("InfoUser Não Baixado - Erro");
    console.log(errorObject.code);
    return null;
  });
}

module.exports = {
  connectToFirebase,
  salvarPedidos,
  setUserInfoInFirebase,
  getUserInfoInFirebase
}