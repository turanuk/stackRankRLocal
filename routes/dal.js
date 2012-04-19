module.exports = function (app, dal) {

  app.get('/getTeam', function(req, res){
    dal.getTeam(res);
  });

  app.post('/openTeam', function (req, res) {
    if (req.files.uploadedFile) {
      console.log('File Uploaded');
      dal.processTeam(req.files.uploadedFile, res);
    }
  });

  app.post('/saveTeam', function(req, res){
    dal.saveTeam(req.body, res);
  });

  app.get('/downloadFile', function (req, res) {
    dal.downloadFile(req.query.teamName, res);
  });
}