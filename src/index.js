const { color } = require('./global');
const { commitFiles, getVersion } = require('./cmds');
const { parseCommits, semverBump } = require('./parse');
const { updateChangelog, updatePackage } = require('./files');
const { _COMMIT_CHANGELOG_CONTEXT_PATH: CONTEXT_PATH } = global;

/**
 * Set changelog and package.
 *
 * @param {object} params
 * @param {string} params.contextPath
 * @param {string} params.date
 * @param {boolean} params.isCommit
 * @param {boolean} params.isDryRun
 */
const commitChangelog = ({ contextPath = CONTEXT_PATH, date, isCommit, isDryRun } = {}) => {
  if (process.env.NODE_ENV !== 'test') {
    process.chdir(contextPath);
  }

  const parsedCommits = parseCommits();
  const { bump, weight } = semverBump(parsedCommits);
  const { clean: cleanVersion, version } = getVersion(bump);

  if (isDryRun) {
    console.info(
      color.CYAN,
      `\nDry run CHANGELOG.md output...\nVersion: ${version}\nSemver bump: ${bump}\nSemver weight: ${weight}`
    );
  }

  const changelog = updateChangelog(parsedCommits, cleanVersion, { isDryRun, date });
  const packageJSON = updatePackage(bump, { isDryRun });

  if (isCommit && !isDryRun) {
    commitFiles(cleanVersion);
  }

  if (isDryRun) {
    console.info(color.NOCOLOR);
  }

  return {
    changelog,
    package: packageJSON,
    parsedCommits,
    semverBump: bump,
    semverWeight: weight,
    version,
    versionClean: cleanVersion
  };
};

module.exports = { commitChangelog };
