module.exports = async ({github, context, core}) => {
  const {data: pr} = await github.rest.pulls.get({
    pull_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });
  // the PR is editorial, it doesn't need to be listed in amendments
  if (pr.labels.find(l => l.name === "Editorial")) {
    return;
  }
  const amendments = require(process.env.GITHUB_WORKSPACE + '/amendments.json');
  if (!Object.values(amendments).find(list => list.find(a => Array.isArray(a.pr) ? a.pr.includes(context.issue.number) : a.pr === context.issue.number ))) {
     core.setFailed(`Pull request ${context.issue.number} not labeled as editorial and not referenced in amendments.json`);
  }

};
