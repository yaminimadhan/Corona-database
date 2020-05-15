const express=require("express");
const https=require("https");
const bodyParser=require("body-parser");
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});		
app.post("/", function(req, res){
	var query=req.body.country;    
    var options = {
		"method": "GET",
	    "hostname": "covid-19-data.p.rapidapi.com",
	    "port": null,
	    "path": "/country?format=undefined&name=" + query,
	    "headers": {
			"x-rapidapi-host": "covid-19-data.p.rapidapi.com",
		     "x-rapidapi-key": "87a03042f9msh67589f02e79350cp15b96djsn769a540e558d"
	    }
	};
	var request = https.request(options, function (response) {
		var chunks = [];

	    response.on("data", function (chunk) {
			chunks.push(chunk);
	    });

	    response.on("end", function () {
			var body = Buffer.concat(chunks);
			var updatedata=body.toString();
			res.write( updatedata);
        	res.send();   
	 	});
	});
	request.end();
})

app.listen(3000, function(){
    console.log('server running on port 3000');
})


