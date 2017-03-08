var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

io.on("connection", function(client) {
	console.log("a client is connected!");
	client.emit("You are connected!");

	client.on("drawing", function(data) {
		client.broadcast.emit("drawFromOtherClients", data);
	});

});

var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log("App started on port: " + port);
});
