// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;
// Create the Note schema
var CommentsSchema = new Schema({
  // Just a string
  title: {
    type: String
  },
  // Just a string
  body: {
    type: String
  }
});
var Comments = mongoose.model("Comments", CommentsSchema);
module.exports = Comments;