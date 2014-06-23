#!/usr/bin/env node
/*jshint node: true*/

'use strict';

var Phonebook = require('./phonebook.js');

//command store
var commands = {
  create: function(fileName) {
    var phonebook = new Phonebook(
      fileName, 
      function(err) {
        if (err) {
          console.log(err.message);
        } else {
          console.log('Phonebook ' + fileName + ' created successfully.');
        }
      }
    );
    phonebook.close();
  },
  add: function(name, phonenumber, filename) {
    var phonebook = new Phonebook(filename);
    phonebook.add(
      name,
      phonenumber,
      function(err, result) {
        if (!err) {
          console.log('Successfully added ' + name + ' into the phonebook.');
        } else {
          console.log(err.message);
        } 
      
      }
    );
      phonebook.close();
  },
  lookup: function(name, fileName) {
    var phonebook = new Phonebook(fileName);    
    phonebook.find(
      name,
      function(err, row) {
        if (err) {
          console.log('Name ' + name + ' was not found.');
        } else {
          console.log(row.fullName, row.phoneNumber);
        }
      }
    );
   phonebook.close();
  },
  change: function(name, phoneNumber, fileName) {
    var phonebook = new Phonebook(fileName);
    phonebook.update(
      name,
      phoneNumber,
      function(err, result) {
        if (err) {
          console.log(err.message);
        } else {
          if (result.changes > 0) {
            console.log('Successfully updated ' + name + ' with new number ' + phoneNumber + '.');
          } else {
            console.log('Error updating ' + name + ' with new number ' + phoneNumber + '.');
          }
        }
      }
    );
    phonebook.close();
  },
  remove: function(name, fileName) {
    var phonebook = new Phonebook(fileName);
    phonebook.remove(
      name,
      function(err, result) {
        if (!err && result.changes > 0) {
          console.log('Successfully removed ' + name + ' from phonebook.');
        } else {
          console.log(err.message);
        }

      }        
    );
    phonebook.close();
  },
  'reverse-lookup': function(phoneNumber, fileName) {
    var phonebook = new Phonebook(fileName);
    phonebook.findByNumber(
      phoneNumber,
      function(err, row) {
        if (err) {
          console.log(err.message);
        } else {
          console.log(row.fullName, row.phoneNumber);
        }
      }
    );
    phonebook.close();
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
var currentCommand = (args[0] || '').toLowerCase();
console.log(currentCommand);

// check to see if the command exists, if not just force it back to lookup
if (!commands[currentCommand]) {
  currentCommand = 'lookup';
} else {
  // remove the first arg from the list
  args = args.slice(1,args.length);
}

// use apply to pass args as an array to the command
commands[currentCommand].apply(null,args);
