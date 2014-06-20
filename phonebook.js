#!/usr/bin/env node
/*jshint node: true*/

'use strict';

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

function openDb(fileName) {
  if (!fs.existsSync(fileName)){
    console.log("Phonebook " + fileName + " does not exist.");
    return null;
  }
  return new sqlite3.Database(fileName);
}

function findExact(db, name, onFound, onNotFound){
  db.get(
    'SELECT count(*) as rowCount FROM phonebook WHERE name = $name',
    { $name: name },
    function(err, row) {
      if (row && row.rowCount > 0) {
        onFound();
      } else {
        onNotFound();
      }
    });
}

//command store
var commands = {
  create: function(fileName) {
    if (!fs.existsSync(fileName)) {
      var db = new sqlite3.Database(fileName);
      db.serialize (function() {
        db.run("CREATE TABLE phonebook (name TEXT, phonenumber TEXT)");
      });
      db.close();
      console.log('Phonebook ' + fileName + ' created successfully.');
    } else {
      console.log('Phonebook ' + fileName + ' already exists');
    }
  },
  add: function(name, phonenumber, filename) {
   
    var db = openDb(filename);
    if (!db) { return; }

    findExact(db, name, 
              function found(){
                console.log('Name ' + name + ' already exists in the phonebook.');
                db.close();
              }, 
              function notFound() {
                db.run('INSERT INTO phonebook (name, phonenumber) VALUES ($name, $phonenumber)', {
                  $name: name,
                  $phonenumber: phonenumber
                }, function(err, row) {
                  if (!err) {
                    console.log('Successfully added ' + name + ' into the phonebook.');
                  } else {
                    console.log(err);
                  } 
                  db.close();
                });
              });
  },
  lookup: function(name, fileName) {
 
    var db = openDb(fileName);
    if (!db) { return; } 
    var found = 0;
    db.each('SELECT * FROM phonebook WHERE name LIKE $name', 
      {
        $name: ( '%' +  name + '%' )
      }, 
      function(err, row){
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(row.name, row.phonenumber);
        found += 1;
      },
      function() {
        if (found < 1) {
          console.log('Name ' + name + ' was not found.');
        }
        db.close();
      });
   
  },
  change: function(name, phoneNumber, fileName) {
    var db = openDb(fileName);
    if (!db) { return; } 
    findExact(db, name, 
              function found() {
                db.run('UPDATE phonebook SET phonenumber = $phonenumber WHERE name = $name',
                {
                  $phonenumber : phoneNumber,
                  $name : name
                }, function(err) {                  
                  if(!err && this.changes > 0 ) {
                    console.log('Successfully updated ' + name + ' with new number ' + phoneNumber + '.');
                  } else {
                    console.log('Error updating ' + name + ' with new number ' + phoneNumber + '.');
                    console.log(err);
                  }
                });
              },
              function notFound() {
                console.log('Name ' + name + ' does not exist in the phonebook.');
                db.close();
              });
  },
  remove: function(name, fileName) {
    var db = openDb(fileName);
    if (!db) { return; } 
    findExact(db, name, 
              function found() {
                db.run('DELETE FROM phonebook WHERE name = $name',
                       { $name: name },
                       function(err) {
                         if (!err && this.changes > 0) {
                           console.log('Successfully removed ' + name + ' from phonebook.');
                         } else {
                           console.log('Error removing ' + name + ' from phonebook.');
                           console.log(err);
                         }
                       });
              },
              function notFound() {
                console.log('Name ' + name + ' does not exist in the phonebook.');
                db.close();
              });
  },
  'reverse-lookup': function(phoneNumber, fileName) {
    var db = openDb(fileName);
    if (!db) { return; }
    var found = 0;
    db.each('SELECT * FROM phonebook WHERE phonenumber LIKE $phonenumber',
            { 
              $phonenumber: '%' + phoneNumber + '%'
            },
            function(err, row) {
               if (err) {
                console.log(err);
                throw err;
              }
              console.log(row.name, row.phonenumber);
              found += 1;
            },
            function() {
              if (found === 0) {
                console.log('Phone number ' + phoneNumber + ' does not exist.');
              }
              db.close();
            });
  }
};


// copy to local var
var args = process.argv;
if (args.length <= 0) {
  process.exit(1);
}

// we are running via node, get rid of node and jsfile
if (args[0] === 'node'){
  args = args.slice(2, args.length);
}

// assume the first parameter is the command, default to empty string to prevent errors
var currentCommand = args[0] || '';

// check to see if the command exists, if not just force it back to lookup
if (!commands[currentCommand]) {
  currentCommand = 'lookup';
} else {
  // remove the first arg from the list
  args = args.slice(1,args.length);
}

// use apply to pass args as an array to the command
commands[currentCommand].apply(null,args);
