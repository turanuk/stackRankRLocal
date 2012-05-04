var exports = module.exports;
var async = require('async');
var fs = require('fs');

var baseData = function() {
  var temp = {
    "Name": "My Team",
    "MetaDataFieldNames": [],
    "Rankings": [
      {
        "Name": "5",
        "People": []
      },
      {
        "Name": "4",
        "People": []
      },
      {
        "Name": "3",
        "People": []
      },
      {
        "Name": "2",
        "People": []
      },
      {
        "Name": "1",
        "People": []
      }
    ]
  };
  return temp;
}
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
        var jsonOutput = new baseData();
        var fileContents = data.toString();
        var rowArray = fileContents.split('\r\n');
        //First row is metadata, handle that first
        var firstRowContents = rowArray[0].split(',');
        //Start from 2 as the first two fields are the name and ranking, ignore them
        for (var i = 2; i < firstRowContents.length; i++) {
          jsonOutput.MetaDataFieldNames.push(firstRowContents[i]);
        }
        //Now process the remaining rows of data
        for (var j = 1; j < rowArray.length; j++) {
          var rowContents = rowArray[j].split(',');
          var person = { MetaData:[] };
          person.Name = rowContents[0];
          //Start from 2 because index 1 is the ranking
          /*for (var k = 2; k < rowContents.length; k++) {
            person.MetaData.push(rowContents[k]);
          }*/
          person.lil = rowContents[2];
          person.clvl = rowContents[3];
          person.promo = rowContents[4];
          person.lastr = rowContents[5];
          //Push person into the ranking 
          jsonOutput.Rankings[5-parseInt(rowContents[1])].People.push(person);
        }
      } catch (err) {
        if (err) {
          callback(err);
        }
      }
      if (fileContents) {
        fs.writeFile('./stackRank.stackRank', JSON.stringify(jsonOutput), function (err, data) {
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

exports.downloadFile = function (teamName, response) {
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
      response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache', 'Content-Disposition': 'attachment; filename=' + teamName + '.stackRank' });
      var fileOutput = 'Name,Ranking,';
      var jsonContent = JSON.parse(data.toString());
      fileOutput += jsonContent.MetaDataFieldNames;
      //Pull people out of rankings
      for (var i = 0; i < jsonContent.Rankings.length; i++) {
        var currentRanking = jsonContent.Rankings[i];
        if (currentRanking.People) {
          for (var j = 0; j < currentRanking.People.length; j++) {
            fileOutput += '\r\n';
            fileOutput += currentRanking.People[j].Name;
            fileOutput += ',';
            fileOutput += currentRanking.Name;
            fileOutput += ',';
            fileOutput += currentRanking.People[j].lil;
            fileOutput += ',';
            fileOutput += currentRanking.People[j].clvl;
            fileOutput += ',';
            fileOutput += currentRanking.People[j].promo;
            fileOutput += ',';
            fileOutput += currentRanking.People[j].lastr;
          }
        }
      }
      response.write(fileOutput.toString());
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
