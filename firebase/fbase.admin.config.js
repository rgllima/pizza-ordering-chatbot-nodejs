const connectToFirebase = () => {
  var admin = require("firebase-admin");  
  var serviceAccount = require("./serviceAccountKey.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pizza-ordering-demo.firebaseio.com"
  });
  return admin;
}

const salvarPedidos = (admin, respostaWatson, res, payld)=> {
  var ret = '';
  var db = admin.database();
  
  if (respostaWatson != null){
     var id = respostaWatson.context.conversation_id;
     db.ref("/pedidos/" + id).set({
       Data: respostaWatson,
       Status: "Pendente",
       Address: "",
       Name: res.name,
       Id: res,
       PayLD: payld
     });
  }
}

module.exports = {
  connectToFirebase, salvarPedidos
}