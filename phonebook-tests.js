/*jshint node: true*/
/*global describe, it, beforeEach*/

var Phonebook = require('./phonebook.js');

describe('Phonebook', function() {
  
  var phonebook;
  beforeEach(function(done) {
    phonebook = new Phonebook(':memory:', function() {
      phonebook.add('jane doe', '555 555 5555', done);
    });
  });
  
  describe('#add', function() {
    it('should add a new person without an error', function(done){
      phonebook.add('john doe','555 555 555', done);
    });
    it('should throw an error when adding an existing person', function(done) {
      phonebook.add('jane doe', '555 555 555', function(err){
        if (!err) {
          throw new Error("did not throw an exception");
        }
        done();
      });
    });
  });
  
  describe('#find', function() {
    it('should find jane', function(done) {
      phonebook.find('jane', function(err, row) {
        if (err) {
          throw new Error("did throw an exception");
        }
        done();
      });
    });
     it('should find Jane', function(done) {
      phonebook.find('Jane', function(err, row) {
        if (err) {
          throw new Error("did throw an exception");
        }
        done();
      });
    });
    it('should not find john', function(done) {
      phonebook.find('john', function(err, row) {
        if (!err) {
          throw new Error("did not throw an exception");
        }
        done();
      });
    });
  });
  
  describe('#findByNumber', function() {
    it('should find 555', function(done) {
      phonebook.findByNumber('555', function(err, row) {
        if (err) {
          throw new Error("did throw an exception");
        }
        done();
      });
    });
    it('should not find 666', function(done) {
      phonebook.findByNumber('666',function(err, row) {
        if (!err) {
          throw new Error("did not throw an exception");
        }
        done();
      });
    });
  });
  
  describe('#remove', function() {
    it('should remove jane doe', function(done) {
      phonebook.remove('jane doe', function(err, result) {
        if (result.changes !== 1) {
          throw new Error();
        }
        phonebook.find('jane doe',function(err, row) {
          if (!err) {
            throw new Error('jane doe was found');
          }
          done();
        });
      });
    });
  });
  
  describe('#update', function() {
    it('should update jane doe', function(done) {
      phonebook.update('jane doe', '555 555 6666', function(err){
        if (err) { throw err; }
        phonebook.findByNumber('6666', function(err) {
          if (err) { throw err; }
          done();
        });
      });
    });  
  });
  
  
 
});