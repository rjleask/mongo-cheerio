$.get("/", function(data) {});
// $("body").on("click",".btn-info",function(){
//     $.ajax({
//     	url: "/cleardb",
//     	method: "DELETE"
//     }).done(function(data){
//     	// $(".pokeBox").remove();
//     })
// })
// delete pokemon on click
$("body").on("click", ".remove", function() {
  var pokemonId = $(this).siblings("#poke-id").text();
  var myUrl = "/remove/" + pokemonId;
  console.log(myUrl);
  $.ajax({
    url: myUrl,
    type: "DELETE"
  }).done(function(data) {})
  $(this).parent().remove();
})

// view/add comments for a pokemon
$("body").on("click", ".edit", function() {
  var thisId = $(this).attr("id");
  $(this).css("display", "none");
  $(this).siblings(".remove").css("display", "none");
  // var pokemonId = $(this).siblings("#poke-id").text();
  $.ajax({
    method: "GET",
    url: "/pokemon/" + thisId
  }).done(function(data) {
    console.log(data);
    $(".pokeBox").append("<div class='comment-box'></div>");
    $(".comment-box").append("<h2>" + data.title + "</h2>");
    $(".comment-box").append("<input id='titleinput' name='title'>");
    $(".comment-box").append("<textarea id='bodyinput' value='" + data.comment + "' name='body'>");
    $(".comment-box").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
    $(".comment-box").append("<button data-id='" + data._id + "' id='closecomment'>Close</button>");
    console.log(data.comment);
    if (data.comment) {
      // Place the title of the comment in the title input
      $("#titleinput").val(data.comment.title);
      // Place the body of the comment in the body textarea
      $("#bodyinput").val(data.comment.body);
    }

  })
});

// save comment to database
$("body").on("click", "#savecomment", function() {
  // Grab the id associated with the pokemon from the submit button
  var thisId = $(this).attr("data-id");
  // Run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/pokemon/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
    .done(function(data) {
      $(".comment-box").empty();
      window.location = "/";
    });
  //   // Also, remove the values entered in the input and textarea for comment entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
})
$("body").on("click", "#closecomment", function() {
  window.location = "/";
})