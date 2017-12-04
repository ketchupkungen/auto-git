const simpleGit = require("simple-git/promise");
const path = require('path');
const basePath = '/var/www';
const repoInfo = require('./repos-and-branches.json');

// Checkout a branch and make a pull for that branch
async function pull(repoPath, branch){
  let repo, status, err;
  try {
    repo = simpleGit(repoPath);
    await repo.checkout(branch);
    status = await repo.pull('origin', branch);
  } catch(e) {
    err = e;
  }
  // only log changes and errors
  if(status.files && status.files.length != 0){
    console.log('pull-success', status);
  }
  if(err){
    console.log('pull-error', err);
  }
}

// Every 10 seconds loop through our repos
// and call the pull function
setInterval(()=>{
  for(let repo of repoInfo){
    pull(path.join(basePath, repo.path), repo.branch);
  }

}, 600000);
