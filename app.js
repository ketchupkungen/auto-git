const simpleGit = require("simple-git/promise");
const path = require('path');
const basePath = '/var/www';
const repoInfo = require('./repos-and-branches.json');
const pm = require('promisemaker');
const exec = pm(require('child_process')).exec;

// Checkout a branch and make a pull for that branch
async function pull(repoPath, branch, run){
  let repo, status, err;
  try {
    repo = simpleGit(repoPath);
    await repo.checkout(branch);
    status = await repo.pull('origin', branch);
  } catch(e) {
    err = e;
  }
  let changed = status.files && status.files.length != 0;
  // only log changes and errors
  if(changed){
    console.log('pull-success', repoPath, branch, status);
  }
  if(err){
    console.log('pull-error', repoPath, branch, err);
  }
  if(changed && run){
    for(let cmd of run){
      let err, result = await exec(
        cmd,
        {cwd: repoPath}
      ).catch((e) => err = e);
      if(result){
        console.log('Running ', cmd, '\n', result);
      }
      if(err){
         console.log('Error running ', cmd, '\n', err);
      }
    }
  }
}

// Every 10 seconds loop through our repos
// and call the pull function
setInterval(()=>{
  for(let repo of repoInfo){
    pull(
      path.join(basePath, repo.path),
      repo.branch,
      repo.run
    );
  }

}, 10000);


// cwd = current working directory