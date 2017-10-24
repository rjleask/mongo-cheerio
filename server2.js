
var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Pokemon = require("./models/pokedeck.js");
var Comments = require("./models/comments.js");
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
mongoose.connect("mongodb://heroku_z5mn2pnq:oucq5c4fg2hq7tnu78imrogopi@ds229465.mlab.com:29465/heroku_z5mn2pnq");
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
      // scrape pokemon if it doesnt contain the small class which is empty
      if (i < 14 && $(this).hasClass("small") != true) {
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
  // res.send("Scraping Done!");
  res.render("scrape");
})

// This will get the pokemon we scraped from the mongoDB
app.get("/pokedeck", function(req, res) {
  // Grab every doc in the Pokemon array
  Pokemon.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});
//  get pokemon by id and show comments
app.get("/pokemon/:id",function(req, res){
	Pokemon.findOne({ "_id":req.params.id }).populate("comment").exec(function(err, doc){
		if(err){
			console.log(err);
		}
		else{
			res.json(doc);
		}
	})

})
// post comments into database 
app.post("/pokemon/:id", function(req, res){
	var newComment = new Comments(req.body);
	newComment.save(function(err, doc){
		if(err){
			console.log(err);
		}else{
			Pokemon.findOne({"_id":req.params.id}, {"comment":doc._id}).exec(function(err, doc){
				if(err){
					console.log(err);
				}else{
					res.send(doc);
				}
			})
		}
	})
})

// app.delete("/cleardb", function(req, res) {
      // 	Pokemon.remove({}).exec(function(err, doc){
      // 		if(err){
      // 			console.log(err);
      // 		}
      // 	})
      // })
app.delete("/remove/:id",function(req, res){
	Pokemon.findByIdAndRemove({"_id":req.params.id}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("ok")
		}
	});
})

var PORT = process.env.PORT || 3000;
// Listen on port 3000
Pokemon.remove({}).then(function(){
app.listen(PORT, function() {
  console.log("App running on port 3000!");
})
});