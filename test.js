var modeler = require('./modeler');
var mysql = require('mysql2');
var fs = require('fs');
var path = require('path');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'test',
  password : 'test',
  database : 'test',
	rowsAsArray: false,
	multipleStatements: true
});

var modelsPath = path.resolve(__dirname) + "/exampleModels/";

function saveModels(model){
	fs.writeFile(modelsPath + model.def.name + ".js", JSON.stringify(model, null, 2), function(err) {
		//do something with result here?
		console.log(modelsPath + model.def.name + ".js", err);
	});
}

modeler.init(connection, 'mydb', saveModels, function(err){
	if (err) console.log("err: ", err);
	else console.log("done - check your file output directory for schemas");
})
