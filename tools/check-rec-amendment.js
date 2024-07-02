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
  const prAmendmentSection = Object.values(amendments).find(list => list.find(a => Array.isArray(a.pr) ? a.pr.includes(context.issue.number) : a.pr === context.issue.number ));
  if (!prAmendmentSection) {
    core.setFailed(`Pull request ${context.issue.number} not labeled as editorial and not referenced in amendments.json`);
    process.exit(2);
  }
  const prAmendment = prAmendmentSection.find(a => Array.isArray(a.pr) ? a.pr.includes(context.issue.number) : a.pr === context.issue.number );
  if (!prAmendment.testUpdates || !prAmendment.testUpdates.length === 0) {
    core.setFailed(`Pull request ${context.issue.number} declares an amendment but does not document its test status in testUpdates`);
    process.exit(2);
  }
  const validTestUpdates = ["already-tested", "not-testable"];
  if (typeof prAmendment.testUpdates === "string" && !validTestUpdates.includes(prAmendment.testUpdates)) {
    core.setFailed(`Pull request ${context.issue.number} declares an invalid test status in its amendment testUpdates field`);
    process.exit(2);
  }
  if (Array.isArray(prAmendment.testUpdates) && !prAmendment.testUpdates.every(t => t.match(/^web-platform-tests\/wpt#[0-9]+$/))) {
    core.setFailed(`Pull request ${context.issue.number} declares test updates but not using the expected format to point to web-platform-tests PRs: "web-platform-tests/wpt#NNN"`);
    process.exit(2);
  }
};
