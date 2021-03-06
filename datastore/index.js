const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

Promise.promisifyAll(fs);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id;
  counter.getNextUniqueId(function(err, counterString) {
    if (err) {
      console.log('error!');
    } else {
      id = counterString;
      var filePath = exports.dataDir + '/' + id + '.txt';
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw ('error creating todo');
        } else {
          callback(null, { id, text });
        }
      });
    }
  });   
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + '/' + id + '.txt', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      text = text.toString('utf8');
      var todo = { id, text };
      callback(null, todo);
    }
  });
};

var readOneAsync = Promise.promisify(exports.readOne);

exports.readAll = (callback) => {
  fs.readdirAsync(exports.dataDir)
    .then(function(filenames) {
      var proms = _.map(filenames, function(filename) {
        var id = filename.slice(0, -4);
        return fs.readFileAsync(exports.dataDir + '/' + filename)
          .then(function(fileContents) {
            var text = fileContents.toString('utf8');
            return {id, text};
          });
      });
      Promise.all(proms)
        .then((values) => {
          console.log('LOOK', values);
          callback(null, values);
        });
    });
  // fs.readdir(exports.dataDir, (err, arr) => {
  //   if (err) {
  //     console.log('error reading all');
  //   } else {
  //     var arr2 = [];
  //     for (var i = 0; i < arr.length; i++) {
  //       var id = arr[i].slice(0, -4);
  //       var text = arr[i].slice(0, -4);
  //       var todo = { id, text };
  //       arr2.push(todo);
  //     }
  //     callback(null, arr2);
  //   }
  // });
};



exports.update = (id, text, callback) => {
  exports.readOne(id, function(err, todo) {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(exports.dataDir + '/' + id + '.txt', text, (err) => {
        if (err) {
          throw ('error writing counter');
        } else {
          callback(null, text);
        }
      });  
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(exports.dataDir + '/' + id + '.txt', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, id);
      console.log(exports.dataDir + '/' + id + '.txt was deleted');
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
