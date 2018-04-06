
new Vue({
  el: '#app',
  data: {
    liga: 'Serie A',
    liveScores: []
  },
  mounted () {
      console.log('teste');
      console.log(document.getElementById('livescores'))
      this.$http.get('http://livescore-api.com/api-client/scores/live.json?key=6WjGWWrPHEX9YJVq&secret=mmRh1Fk2aEqxahqgdJX9GoZn3Xw1Grs2').then(
        response => {
            console.log("Ok. Baixado");
            this.liveScores = response.body.data.match;
            console.log(this.liveScores)
        },
        error => {
            console.log(error);
        })
  }
})

// JSON.parse(body).data.match.forEach(element => {
//     if (element.status != 'FINISHED') {
//       message += list + '. ' + element.home_name + " " + element.score + " " + element.away_name + "\n"
//       list++;
//     }
//   });