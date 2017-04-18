# mysqlAutoModels
Automatically create JSON like model structures - can be easily modified for Sequelize or Waterline

It will generate definitions for most common column types as well as create references for foreign keys (for table joins, relationships, etc...).

Simply include and pass in connection, database, per table callback and final callback.


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

You can check test.js for a working implementation.  Should work with rowsAsArray or without.
If you are getting object property/array reference errors, simply check the section starting at line 34 where the various property references are defined.


