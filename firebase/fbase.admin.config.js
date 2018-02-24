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
    history_order: null,
    last_order: null
  });
}

const getUserInfoInFirebase = (admin, idUser) => {
  var db = admin.database();
  db.ref("/clientes/" + id).once("value", (snapshot)=> {
    console.log("InfoUserBaixado");
    console.log(snapshot.val().last_context_dialog);
    
    return snapshot.val().last_context_dialog;
  }, (errorObject)=>{
    .console.log("InfoUser Não Baixado - Erro");
    .console.log(errorObject);
    
    return null;
  })


  var ref = db.ref("server/saving-data/fireblog/posts");

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on("value", function (snapshot) {
    console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

module.exports = {
  connectToFirebase,
  salvarPedidos,
  setUserInfoInFirebase,
  getUserInfoInFirebase
}