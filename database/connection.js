"use strict";

var mysql = require("mysql");

var con = mysql.createConnection({
  host: "aircastdb.com4k2xtorpw.ap-southeast-1.rds.amazonaws.com",
  user: "Gameplandigital",
  password: "Gameplan01",
  database: "pms_db",
  multipleStatements: true
});

// var con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "pms_db",
//   multipleStatements: true
// });

con.connect(function (err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

module.exports.connection = con;
