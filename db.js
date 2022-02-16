//Database test runner

const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('todo.db', (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('conected to databse');
  }
});

// This is how to create a database using sqlite3 in node.js
// db.run(`CREATE TABLE list_table(
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   list_item text,
//   list_type INTEGER,
//   FOREIGN KEY (list_type)
//   REFERENCES type_table (id)
//   ON DELETE CASCADE
//   );`
// );

//Insert into Database
// db.run(`INSERT INTO type_table (type) VALUES (?)`, ["home"], (err)=>{
//   if(err){
//     console.log(err.message);
//   } else {
//     console.log(`A record has been added`);
//   }
//
// });

//Select from database (use each for each object or all for an array of objects)
// db.each(`SELECT * FROM list`, (err, row)=>{ //can also use db.all to return an array of objects
//   if(err){
//     console.log(err.message);
//   } else {
//     console.log(row);
//   }
// });

//Delete from database
// db.run(`DELETE FROM list WHERE list_item = ?`, "" (err)=> {
//   if(err){
//     console.log(err.message);
//   } else {
//     console.log(`record deleted`);
//   }
// });



//Close database
db.close((err)=> {
  if(err) {
    console.log(err.message);
  } else {
    console.log('database closed');
  }
});
