/**
 * Handle payloads received from Github and
 * launch the corresponding build if necessary
 */

var Project = require('../lib/project')
  , executor = require('../lib/executor')
  , customUtils = require('../lib/customUtils')
  , db = require('../lib/db')
  , _ = require('underscore')
  ;

module.exports = function (req, res, next) {
  db.settings.findOne({ type: 'generalSettings' }, function (err, settings) {
    if (req.query.token === undefined || req.query.token.length === 0 ||
      req.query.token !== settings.githubToken) { return res.send(200); }
    console.log(req.body);
    db.projects.find({}, function (err, projects) {
      var payload = req.body
        , receivedGithubRepoUrl = payload.repository.url
        , receivedBranch = payload.ref.replace(/^.*\//,'')
        ;

      console.log('repo '+ receivedGithubRepoUrl);
      console.log('branch '+ receivedBranch);
      // Build all the enabled projects corresponding using the repo and branch of
      // this push
      projects.forEach(function (project) {
        console.log('project repo '+ project.githubRepoUrl);
        console.log('project branch '+ project.branch);
        console.log('checking...');

        if (project.githubRepoUrl == receivedGithubRepoUrl && project.branch ==
          receivedBranch) {
          console.log('Detected that we should build the project ' +receivedGithubRepoUrl);
          if (project.enabled) {
            console.log('registering build ' + project.name);
            executor.registerBuild(project.name);
          } else {
            Project.getProject(project.name, function (err, project) {
              if (err || !project) {
                console.log('Error retrieving the project: ' + err);
                return; }
              console.log('Advertising the build now.');
              project.advertiseBuildResult(null);
            });
          }
        }
      });
      return res.send(200);   // Always return a success
    });
  });
};
