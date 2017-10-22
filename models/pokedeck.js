// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;
// Create article schema
var PokemonSchema = new Schema({
  // title is a required string
  pokeId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  pokeType: {
    type: String,
    required: true
  },
  stages: {
    type: String,
    required: false
  }
});
// Create the Article model with the ArticleSchema
var Pokemon = mongoose.model("Pokemon", PokemonSchema);
// Export the model
module.exports = Pokemon;