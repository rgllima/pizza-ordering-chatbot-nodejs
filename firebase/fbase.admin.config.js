const connectToFirebase = () => {
  var admin = require("firebase-admin");  
  var serviceAccount = require("./serviceAccountKey.json");
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pizza-ordering-demo.firebaseio.com"
  });
  return admin;
}

<<<<<<< HEAD
const salvarPedidos = (admin, respostaWatson, res, sender, payld)=> {
=======
const salvarPedidos = (admin, respostaWatson, res, sender, payld, req, res)=> {
>>>>>>> aed4553ca78b14df504bcba534b94c2acd7973d7
  var ret = '';
  var db = admin.database();
  
  if (respostaWatson != null){
     var id = respostaWatson.context.conversation_id;
     db.ref("/pedidos/" + id).set({
       Data: respostaWatson,
       Status: "Pendente",
       Address: "",
       Name: res.name,
       Id: res.id,
       SenderUser: sender,
<<<<<<< HEAD
       PayLD: payld
=======
       PayLD: payld,
       Res: res,
       Req, req
>>>>>>> aed4553ca78b14df504bcba534b94c2acd7973d7
     });
  }
}

module.exports = {
  connectToFirebase, salvarPedidos
}