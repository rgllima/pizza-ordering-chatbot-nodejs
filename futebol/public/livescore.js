
new Vue({
  el: '#app',
  data: {
    liga: 'Serie A'
  },
  mounted () {
      console.log('teste');
      console.log(document.getElementById('livescores'))
      this.$http.get('http://livescore-api.com/api-client/scores/live.json?key=6WjGWWrPHEX9YJVq&secret=mmRh1Fk2aEqxahqgdJX9GoZn3Xw1Grs2').then(
        response => {
            console.log("Ok. Baixado");
            
            console.log(response.body)
        },
        error => {
            console.log(error);
        })
  }
})