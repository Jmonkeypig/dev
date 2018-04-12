var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'o2'
});

connection.connect();

//1. db 검색
// var sql ='SELECT * FROM topic';
// connection.query(sql, function (error, rows, fields) {
//   if (error){
//     console.log(error);
//   }else{
//     // console.log('rows', rows);
//     // console.log('fields', fields);
//     for (var i = 0; i < rows.length; i++) {
//       console.log(rows[i].title);
//       console.log(rows[i].author);
//     }
//   }
// });

//2. db 추가
var sql2 = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
var params = ['Supervisor5', 'Watcher5', 'graphittie5'];

connection.query(sql2, params, function(err, rows, fields){
  if (err) {
    console.log(err);
  }else{
    console.log(rows.insertId);
  }
});

//3. db 변경
// var sql3 = 'UPDATE topic SET title=?, author=? WHERE id=?';
// var params = ['AAA', 'Dstrict', 1];
//
// connection.query(sql3, params, function(err, rows, fields){
//   if (err) {
//     console.log(err);
//   }else{
//     console.log(rows);
//   }
// });

//4. db 삭제
// var sql4 = 'DELETE FROM topic WHERE id=?';
// var params = [1];
//
// connection.query(sql4, params, function(err, rows, fields){
//   if (err) {
//     console.log(err);
//   }else{
//     console.log(rows);
//   }
// });

connection.end();
