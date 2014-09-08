/**
 * Handle payloads received from Github and
 * launch the corresponding build if necessary
 */

var Job = require('../lib/job')
  , executor = require('../lib/executor')
  , customUtils = require('../lib/customUtils')
  , db = require('../lib/db')
  , _ = require('underscore')
  ;


module.exports = function (req, res, next) {
  db.settings.findOne({ type: 'generalSettings' }, function (err, settings) {
    if (req.query.token === undefined || req.query.token.length === 0 || req.query.token !== settings.githubToken) { return res.send(200); }
    console.log(req.body);
    db.jobs.find({}, function (err, jobs) {
      var payload = req.body
        , receivedGithubRepoUrl = payload.repository.url
        , receivedBranch = payload.ref.replace(/^.*\//,'')
        ;

      console.log('repo '+ receivedGithubRepoUrl);
      console.log('branch '+ receivedBranch);
      // Build all the enabled jobs corresponding using the repo and branch of this push
      jobs.forEach(function (job) {
        console.log('job repo '+ job.githubRepoUrl);
        console.log('job branch '+ job.branch);

        if (job.githubRepoUrl === receivedGithubRepoUrl && job.branch === receivedBranch) {
          if (job.enabled) {
            executor.registerBuild(job.name);
          } else {
            Job.getJob(job.name, function (err, job) {
              if (err || !job) { return; }
              job.advertiseBuildResult(null);
            });
          }
        }
      });

      return res.send(200);   // Always return a success
    });
  });
};
