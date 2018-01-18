// var http = require('http');
// var fs = require('fs');
//
// function onRequest(request, response){
//     response.writeHead(200, {'Content-Type': 'text/html'});
//     fs.readFile('./dist/index.html', null, function(error, data) {
//       if (error) {
//         response.writeHead(404);
//         response.write('File not found!!');
//       } else {
//         response.write(data);
//       }
//         response.end();
//     });
// }
// http.createServer(onRequest).listen(3000);


var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/dist'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});