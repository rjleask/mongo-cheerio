
var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Pokemon = require("./models/pokedeck.js");
// Our scraping tools
var exphbs = require("express-handlebars");
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;
// Initialize Express
var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
// Make public a static dir
// app.use(express.static("public"));
app.use(express.static(__dirname + '/public/assets'));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/pokemon");
var db = mongoose.connection;
// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// routes
// 
// 
app.get("/", function(req, res){
	var pokePacket = {
		pokeData:[] 
	};
	Pokemon.find({}, function(err, data){
     for(var i=0; i<data.length;i++){
        pokePacket.pokeData.push(data[i]);
     }
	res.render("index",{pokeData:pokePacket.pokeData});
	})
})
app.get("/pokemon", function(req, res) {
  request("https://pokemondb.net/evolution", function(error, response, html) {
    var $ = cheerio.load(html);
    $(".infocard-tall").each(function(i, element) {
      var result = {};
      // scrape 10 pokemon if it doesnt contain the small class which is empty
      if (i < 10 && $(this).hasClass("small") != true) {
        result.pokeId = $(this).children("small").first().text();
        result.title = $(this).find(".ent-name").text();
        result.image =  $(this).find(".ent-name").text().toLowerCase();
        result.link = "https://pokemondb.net/" + $(this).find(".ent-name").attr("href");
        result.pokeType = $(this).find(".aside").children("a").text();
        result.stages = $(this).parent().find(".ent-name").text();
        // Using our Article model, create a new entry
        var entry = new Pokemon(result);
        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        })
      }
    })
  })
  res.send("Scraping Done!");
})

// This will get the articles we scraped from the mongoDB
app.get("/pokedeck", function(req, res) {
  // Grab every doc in the Pokemon array
  Pokemon.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.delete("/remove/:id",function(req, res){
	Pokemon.remove({_id:req.params.id}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("ok")
		}
	});
})

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});