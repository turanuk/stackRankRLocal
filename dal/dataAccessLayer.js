var exports = module.exports;
var async = require('async');
var fs = require('fs');

//Used to get a specific team
exports.processTeam = function (file, response) {
  async.waterfall([
    //Read uploaded file
    function (callback) {
      if (file.name) {
        fs.readFile(file.path, function (err, data) {
          if (err) {
            callback(err);
          } else {
            callback(null, data);
          }
        });
      } else {
        callback('File uploaded has no name')
      }
    },

    function (data, callback) {
      try {
        var fileContents = JSON.parse(data.toString());
      } catch (err) {
        if (err) {
          callback(err);
        }
      }
      if (fileContents && fileContents.Name) {
        //Move file to new location
        fs.rename(file.path, './stackRank.stackRank', function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      } else {
        callback('File uploaded has a format problem');
      }
    }
  ], function (err) {
    if (err) {
      console.log(err);
    } else {
      response.redirect('/team');
    }
  });
};

exports.getTeam = function (response) {
  async.waterfall([
    //open file from fixed location
    function (callback) {
      fs.readFile('./stackRank.stackRank', function (err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    },

    function (data, callback) {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      response.write(data.toString());
      callback(null);
    }
  ], function (err) {
    if (err) {
      response.writeHead(500, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
      console.log(err);
    }
    response.end();
  });
}

exports.saveTeam = function (data, response) {
  async.waterfall([
    //write to fixed location
    function (callback) {
      fs.writeFile('./stackRank.stackRank', JSON.stringify(data), function (err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  ], function (err) {
    if (err) {
      response.writeHead(500, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
      console.log(err);
    } else {
      response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
    }
    response.end();
  });
}

exports.downloadFile = function (response) {
  async.waterfall([
    //read and stream file
    function (callback) {
      fs.readFile('./stackRank.stackRank', function (err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    },
    function (data, callback) {
      response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache', 'Content-Disposition': 'attachment' });
      response.write(data.toString());
      callback(null);
    }
  ], function (err) {
    if (err) {
      response.writeHead(500, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
      console.log(err);
    }
    response.end();
  });
}