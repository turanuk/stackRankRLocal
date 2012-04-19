var fs = require('fs');

module.exports = function (app) {
  //index
  app.get('/', function(req, res) {
    res.redirect('/uploadFile');
  });

  //login
  app.get('/uploadFile', function (req, res) {
    res.render('uploadFile', { title: 'Upload File' })
  });

  // team view
  app.get('/team', function(req, res) {
    //TODO: Check for file existence
    try {
      var stats = fs.lstatSync('./stackRank.stackRank');
    } catch (err) {
      res.render('uploadFile', { title: 'Upload File' });
    }
    if (stats.isFile()) {
      res.render('team', { title: 'Team' })
    }
  });
}
