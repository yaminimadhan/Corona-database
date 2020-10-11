const express=require("express");
// const https=require("https");
var https = require('follow-redirects').https;
var fs = require('fs');
const bodyParser=require("body-parser");

const app=express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}));


app.get("/", function(req, res){
   
  var options = {
    'method': 'GET',
    'hostname': 'api.covidindiatracker.com',
    'path': '/total.json',
    'headers': {
    },
    'maxRedirects': 20
  };
  
  var request = https.request(options, function (response) {
    var chunks = [];
  
    response.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    response.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      var data=JSON.parse(body);
      var confirmed = data.confirmed;
      var active = data.active;
      var recovered = data.recovered;
      var death = data.deaths;

      var options = {
        'method': 'GET',
        'hostname': 'api.covidindiatracker.com',
        'path': '/state_data.json',
        'headers': {
        },
        'maxRedirects': 20
      };
      
      var request = https.request(options, function (response) {
        var chunks = [];
      
        response.on("data", function (chunk) {
          chunks.push(chunk);
        });
        
        response.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          data=JSON.parse(body);
          res.render("index",{confirmed:confirmed, active:active, recovered:recovered, death:death, dataset:data });
        });
      
        response.on("error", function (error) {
          console.error(error);
        });
      });
      
      request.end();

      
      
    });
  
    response.on("error", function (error) {
      console.error(error);
    });
  });
  
  request.end();
});		


// app.post("/", function(req, res){
	    
//   var options = {
//     'method': 'GET',
//     'hostname': 'api.covidindiatracker.com',
//     'path': '/state_data.json',
//     'headers': {
//     },
//     'maxRedirects': 20
//   };
  
//   var request = https.request(options, function (response) {
//     var chunks = [];
  
//     response.on("data", function (chunk) {
//       chunks.push(chunk);
//     });
  
//     response.on("end", function (chunk) {
//       var body = Buffer.concat(chunks);
//       var data=JSON.parse(body);
//       console.log(data[0])
//     });
  
//     response.on("error", function (error) {
//       console.error(error);
//     });
//   });
  
//   request.end();
// })

app.listen(3000, function(){
    console.log('server running on port 3000');
})


