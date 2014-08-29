var express = require('express');
var app = express();

//app.use("/routeOne", express.static(__dirname + "/app/"));
app.use("/", express.static(__dirname + "/app"));

app.listen(3000);