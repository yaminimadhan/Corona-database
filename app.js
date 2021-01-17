const express=require("express");
var https = require('follow-redirects').https;
var fs = require('fs');
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
var path = require('path'); 
var multer = require('multer');

const app=express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, 'uploads') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.fieldname + '-' + Date.now()) 
  } 
}); 

var upload = multer({ storage: storage });

mongoose.connect("mongodb://localhost:27017/NewsDB", {useNewUrlParser: true, useUnifiedTopology: true})
const newsSchema = new mongoose.Schema({
    title :String,
    content :String,
    image: { 
      data: Buffer, 
      contentType: String 
  } 
})
const News = new mongoose.model('News',newsSchema);


app.get("/cases", function(req, res){
   
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

app.get("/", function(req,res){
  res.render("home");
})

app.get("/compose", function(req,res){
  res.render("compose");
})

app.post("/compose", upload.single('image'), (req, res, next) => {
  var newnews = new News({ 
    title:req.body.postTitle,
    content:req.body.postBody,
      image: { 
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
          contentType: 'image/jpg'
      } 
  }); 
  newnews.save();
  console.log(newnews); 
})

app.get("/news", function(req,res){
  News.find({}, function(err, news){
    res.render("news", {
      news: news,
      });
  });
})

app.get("/news/:newsId", function(req, res){

  const requestedNewsId = req.params.newsId;
  
    News.findOne({_id: requestedNewsId}, function(err, news){
      res.render("article", {
        news :news
      });
    });
  
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


