var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');
var infile = "index.html";
var indxBuff = fs.readFileSync(infile);
var indxStr = indxBuff.toString();

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
  response.send(indxStr);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
