var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'elltdev.cbue0iqm0djc.ap-northeast-2.rds.amazonaws.com',
  user: 'b2_dba',
  password: 'qwer1234',
  database: 'elltgddev'
  //database: 'information_schema'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  const sql = "select * from gd_goods a, gd_goods b";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
});