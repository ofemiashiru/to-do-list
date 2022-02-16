//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require("ejs");
const _ = require("lodash");

const myDate = require(path.join(__dirname, "date.js")); //coming from date.js module
//storing module in constant called myDate, now I have access to all the functions
//and data in that file

const sqlite3 = require('sqlite3').verbose();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public")); //access all static files i.e. files that are not reliant on the server

app.set('view engine', 'ejs'); // looks in the views directory for templates

app.use(bodyParser.urlencoded({
  extended: true
}));

let theDate = myDate.getDate();
//activating getDate function after being exported from date.js
// and storing it in the variable theDate
const homeID = 91
//****** Home Root GETTING
app.get('/', function(req, res) {
  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  db.serialize(() => {
    db.each(`SELECT * FROM type_table WHERE type = ?`, ["home"], (err, row) => {
      if (err) {
        console.log(err);
      }
      res.locals.listTitle = row.type;
      res.locals.typeID = row.id;
      res.locals.theDate = theDate;
    });
  });

  db.all(`SELECT * FROM list_table WHERE list_type = ?`, [homeID], (err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      res.render('list', {
        allItems: rows
      });
    }
  });

  //Close Database
  db.close((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('database closed');
    }
  });
});

//****** List Item POSTING Path
app.post('/', function(req, res) {
  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  //Getting the listTypeID and item from the POST request
  let listTypeID = req.body.list_type;
  let item = req.body.newItem;

  //Pushing the listTypeID and item into our list_table in database
  db.run(`INSERT INTO list_table (list_item, list_type) VALUES (?,?)`, [item, listTypeID], (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(`A record has been added`);
    }
  });

  db.each(`SELECT * FROM type_table WHERE id = ?`, [listTypeID], (err, row) => {
    if (err) {
      console.log(err.message)
    } else {
      res.redirect('/list/' + row.type);
    }
  });

  //Close database
  db.close((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('database closed');
    }
  });

});

//****** List Item DELETE Path
app.post('/delete', function(req, res) {
  console.log(req.body);
  itemID = req.body.checkbox;

  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  db.serialize(() => {
    db.each(`SELECT * FROM list_table WHERE id = ?`, [itemID], (err, row) => {
      if (err) {
        console.log(err.message);
      } else {
        db.serialize(() => { //Getting the list_type so that we can redirect to it at the end of executtion
          db.each(`SELECT * FROM type_table WHERE id = ?`, [row.list_type], (err, row) => {
            if (err) {
              console.log(err.message);
            } else {
              let listType = row.type; //Storing the list_type for redirection
              db.serialize(() => {
                //Delete from Database
                db.run(`DELETE FROM list_table WHERE id= ?`, itemID, (err) => {
                  if (err) {
                    console.log(err.message);
                  } else {
                    console.log(`record deleted`);
                  }
                });
              });

              db.serialize(() => {
                //Close database
                db.close((err) => {
                  if (err) {
                    console.log(err.message);
                  } else {
                    console.log('database closed');
                  }
                });
              });
              res.redirect('/list/' + listType); //concatenating list_type in the redirect
            }
          });
        });
      }
    });
  });
});


//****** List Types GETTING Path
app.get('/alllists', function(req, res) {

  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  //Select all the List Types from Database
  db.all(`SELECT * FROM type_table`, (err, row) => {
    if (err) {
      console.log(err.message);
    } else {
      res.render('alllists', {
        allLists: row,
        listID: row.id
      });
    }
  });

  //Close database
  db.close((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('database closed');
    }
  });

});

//****** List Types POSTING Path
app.post("/alllists", function(req, res) {

  let newListType = _.lowerCase(req.body.newType);

  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  db.run(`INSERT INTO type_table (type) VALUES (?)`, [newListType], (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(`A record has been added`);
    }
  });

  //Close database
  db.close((err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('database closed');
    }
  });

  res.redirect('/alllists');

});

//****** List Types DELETING Path --
app.post('/deletetype', function(req, res) {

  let listTypeID = req.body.checkbox;
  console.log(listTypeID);

  if (listTypeID != homeID) { //using double equals to catch both integer and string data types === is exact match
    //Open Database
    const db = new sqlite3.Database('todo.db', (err) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log('conected to databse');
      }
    });

    db.run(`DELETE FROM type_table WHERE id = ?`, [listTypeID])
      .run(`DELETE FROM list_table WHERE list_type = ?`, [listTypeID], (err) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(`Record deleted`);

        }
      });
  }



  res.redirect('/alllists');
});


//****** About Page
app.get('/about', function(req, res) {

  res.render('about');
});


//****** List Dynamic Category PATH
app.get('/list/:listType', (req, res) => {

  let found = false;
  const listType = _.lowerCase(req.params.listType); // will store and call list types in lowercase

  //Open Database
  const db = new sqlite3.Database('todo.db', (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('conected to databse');
    }
  });

  db.serialize(() => {
    db.all(`SELECT * FROM type_table`, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      //Searches type_table in database to see if there are any matches
      rows.forEach((item, i) => {
        if (listType === item.type) {
          found = true; //If match is found we set flag to true
        }
      });

      if (found) {
        //Render page with list type and list information if it exists in database

        db.each(`SELECT * FROM type_table WHERE type = ?`, [listType], (err, row) => {
          if (err) {
            console.log(err);
          }
          res.locals.listTitle = row.type;
          res.locals.typeID = row.id;
          res.locals.theDate = theDate;

          db.serialize(() => {
            db.all(`SELECT * FROM list_table WHERE list_type = ?`, [row.id], (err, rows) => {
              if (err) {
                console.log(err.message);
              } else {
                res.render('list', {
                  theDate: theDate,
                  allItems: rows
                });
              }
            });
            //Close database
            db.close((err) => {
              if (err) {
                console.log(err.message);
              } else {
                console.log('database closed');
              }
            });
          });
        });

      } else {

        //Add a list type to table if it does not exist
        db.serialize(() => {
          // Insert Type into type_table
          db.run(`INSERT INTO type_table (type) VALUES (?)`, [listType], (err) => {
            if (err) {
              console.log(err.message);
            } else {
              console.log(`A record has been added`);
            }
          });

          db.serialize(() => {
            db.each(`SELECT * FROM type_table WHERE type = ?`, [listType], (err, row) => {
              if (err) {
                console.log(err.message);
              }
              res.locals.listTitle = row.type;
              res.locals.typeID = row.id;
              res.locals.theDate = theDate;

              db.all(`SELECT * FROM list_table WHERE list_type = ?`, [listType], (err, rows) => {
                if (err) {
                  console.log(err.message);
                } else {
                  res.render('list', {
                    allItems: rows
                  });
                  //Close database
                  db.close((err) => {
                    if (err) {
                      console.log(err.message);
                    } else {
                      console.log('database closed');
                    }
                  });
                }
              });
            });
          });
        });
      }
    });
  });
});


app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
