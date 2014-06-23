/*jshint node: true*/

'use strict';

var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

module.exports = function Phonebook(fileName, next) {
  
  var TABLE_NAME = 'phonebook';
  
  // init db
  var _db = (function(){
    if (fileName !== ':memory:' && !fs.existsSync(fileName)){
      var err = new Error("Phonebook " + fileName + " does not exist.");
      if (!next) { throw err; }
      next(err);
    }
    var db = new sqlite3.Database(fileName);
    db.get("SELECT count(*) as rowCount FROM sqlite_master WHERE type='table' AND name = $tableName",
           {
             $tableName: TABLE_NAME
           },
           function(err,row) {
             if (row && row.rowCount === 0) {
               db.run('CREATE TABLE phonebook (fullName TEXT, phoneNumber TEXT)', function() {
                 if (next) { next(); }
               });
             } else {
               if (next) { next(); }
             }
           });
    return db;
  })();
  
  function findExact(fullName, onFound, onNotFound){
    _db.get(
      'SELECT count(*) as rowCount FROM phonebook WHERE fullName = $fullName',
      { $fullName: fullName },
      function(err, row) {
        if (row && row.rowCount > 0) {
          onFound();
        } else {
          onNotFound();
        }
      });
  }
  
  function NotFoundError(fullName) {
    return new Error("Name " + fullName + " does not exist.");
  }
  
  
  return {
    close: function() {
      if (_db) {
        _db.close();
      }
    },
    add: function add(fullName, phoneNumber, callback) {
      findExact(
        fullName,
        function found() {
          var err = new Error("Name " + fullName + " already exists.");
          if (!callback) {
            throw err;
          }
          callback(err);
        },
        function notFound() {
          _db.run('INSERT INTO phonebook (fullName, phoneNumber) VALUES ($fullName, $phoneNumber)', {
                  $fullName: fullName,
                  $phoneNumber: phoneNumber
                }, function(err, row) {
                  if (!err) {
                    if (callback) { callback(null, this); }
                  } else {
                    if (!callback) {
                      throw err;
                    }
                    callback(err);
                  }
                });
        });
    },
    find: function find(query, callback) {
       var found = 0;
        _db.each(
          'SELECT * FROM phonebook WHERE fullName LIKE $query', 
          {
            $query: ( '%' +  query + '%' )
          }, 
          function(err, row){
            if (err) {
              if (!callback) {
                throw err;
              }
              callback(err);
            }
            found += 1;
            if (callback) { 
              callback(null, row); 
            }
          },
          function() {
            if (found < 1) {
              var err = new NotFoundError(query);
              if (!callback) {
                throw err;
              }
              callback(err);
            }
          });
    },
    update: function(fullName, phoneNumber, callback) {
      findExact(
        fullName, 
        function found() {
          _db.run('UPDATE phonebook SET phoneNumber = $phoneNumber WHERE fullName = $fullName',
          {
            $phoneNumber : phoneNumber,
            $fullName : fullName
          }, function(err) {                  
            if(!err && this.changes > 0 ) {
              if (callback) { callback(null, this); }
            } else {
              if (!callback) { throw err; }
              callback(err);
            }
          });
        },
        function notFound() {
          var err = new NotFoundError(fullName);
          if (!callback) {
            throw err;
          }
          callback(err);
        });
    },
    remove: function(fullName, callback) {
      findExact(
        fullName, 
              function found() {
                _db.run('DELETE FROM phonebook WHERE fullName = $fullName',
                       { $fullName: fullName },
                       function(err) {
                         if (!err && this.changes > 0) {
                           if (callback) {
                            callback(null, this);
                           }
                         } else {
                           if (!callback) {
                             throw err;
                           }
                           callback(err);
                         }
                       });
              },
              function notFound() {
                var err = new NotFoundError(fullName);
                if (!callback) {
                  throw err;
                }
                callback(err);
              });
    },
    findByNumber: function(query, callback) {
      var found = 0;
      _db.each(
        'SELECT * FROM phonebook WHERE phonenumber LIKE $query',
        { 
          $query: '%' + query + '%'
        },
        function(err, row) {
           if (err) {
             if (!callback) { throw err; }
             callback(err);
          }
          found += 1;
          callback(null, row);
        },
        function() {
          if (found === 0) {
            var err = new Error("Phone number " +  query + " was not found.");
            if (!callback) { throw err; }
            callback(err);
          }
          
        });
    }
  };
};
