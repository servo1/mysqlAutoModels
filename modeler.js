
var async = require("async");

(function() {

	var modeler = {};
	root = this;
	if (root != null) {
		previous_modeler = root.modeler;
	}

	modeler.noConflict = function() {
		root.modeler = previous_modeler;
		return modeler;
	};

	function only_once(fn) {
		var called = false;
		return function() {
			if (called) throw new Error("Callback was already called.");
			called = true;
			fn.apply(root, arguments);
		}
	}
	modeler.conn = {};
	modeler.db = "";


	//accepts mysql connection and callback mmcb for mysqlmodelercallback
	modeler.init = function(connection, dbname, saveCb, mmcb) {
		var self = this;
		modeler.db = dbname;
		modeler.conn = connection;
		if (connection.config.rowsAsArray){
			modeler.nameProp = 0;
			modeler.fieldNameProp = 0;
			modeler.tableTypeProp = 1;
			modeler.typeProp = 1;
			modeler.nullProp = 2;
			modeler.columnNameProp = 1;
			modeler.refTableName = 3;
			modeler.refColName = 4;
		} else {
			modeler.nameProp = 'Tables_in_' + modeler.db;
			modeler.fieldNameProp = 'Field';
			modeler.tableTypeProp = 'Table_type';
			modeler.typeProp = 'Type';
			modeler.nullProp = 'Null';
			modeler.columnNameProp = 'COLUMN_NAME';
			modeler.refTableName = 'REFERENCED_TABLE_NAME';
			modeler.refColName = 'REFERENCED_COLUMN_NAME';
		}


		modeler.saveCb = saveCb;

		modeler.conn.query('show full tables', function(err, rows) {
			async.each(rows, function(name, cbgm) {
				self.gen_attribs(name, function(attribs) {
					cbgm();
				});
			}, function(err) {
				mmcb();
			});
		});
	};

	modeler.gen_attribs = function(name, cb) {
		var self = this;

		var refs = [];

		var refsQuery = 'SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, ' +
			'REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE ' +
			'REFERENCED_TABLE_SCHEMA = "' + self.db + '" AND TABLE_NAME = "' +
			name[modeler.nameProp] + '"';
			console.log(name[modeler.nameProp]);
		modeler.conn.query(refsQuery, function(err, fks) {
			refs = fks;

			modeler.conn.query('describe ' + name[modeler.nameProp], function(err, rows) {
				var clxn = {};
				for (var row in rows) {
					console.log(rows[row]);
					clxn[rows[row][modeler.fieldNameProp]] = {};
					switch (true) {
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("tinyint") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "bool";
							break;
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("datetime") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "date";
							break;
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("timestamp") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "date";
							break;
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("int") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "number";
							break;
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("enum") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "enum";
							clxn[rows[row][modeler.fieldNameProp]].values = extractText(rows[row][modeler.typeProp]);
							break;
						case (typeof rows[row] !== "function" && rows[row][modeler.typeProp].toLowerCase().indexOf("json") >= 0):
							clxn[rows[row][modeler.fieldNameProp]].type = "json";
							break;

						default:
							clxn[rows[row][modeler.fieldNameProp]].type = "string";
							break;
					}

					clxn[rows[row][modeler.fieldNameProp]].required = (rows[row][modeler.nullProp] == "YES" ? 1 : 0);
					refs.forEach(function(el, ind) {
						if (rows[row][modeler.fieldNameProp] == el[modeler.columnNameProp]) {
							clxn[rows[row][modeler.fieldNameProp]].refs = {
								model: el[modeler.refTableName],
								key: el[modeler.refColumnName]
							};
						}
					});

				}
				var save = {};
				save.def = {};
				save.def.fields = clxn;
				save.def.name = name[modeler.nameProp];
				save.def.service = 'mysql';
				if (name[modeler.tableTypeProp].indexOf('TABLE') == -1) {
					save.def.type = "view";
				} else {
					save.def.type = "table";
				}
				if (typeof modeler.saveCb == "function"){
					modeler.saveCb(save);
				} else {
					//console.log(save);
				}

				cb(clxn);
				if (err) {
					//console.log(err);
				}
			});
		});
	}

	function extractText(str) {
		var match = [];
		str.replace(/'([^']*)'/g, function($0, $1) {
			match.push($1);
		});
		return match;
	}

	// Node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = modeler;
	}
	// AMD / RequireJS
	else if (typeof define !== 'undefined' && define.amd) {
		define([], function() {
			return modeler;
		});
	}
	// included directly via <script> tag
	else {
		root.modeler = modeler;
	}

}());
