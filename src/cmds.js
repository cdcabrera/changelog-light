const { execSync } = require('child_process');
const { join } = require('path');
const semverClean = require('semver/functions/clean');
const semverInc = require('semver/functions/inc');
const { color } = require('./global');
const { _COMMIT_CHANGELOG_CONTEXT_PATH: CONTEXT_PATH } = global;
/**
 * Execute a command
 *
 * @param {string} cmd
 * @param {object} options
 * @param {string} options.errorMessage
 * @returns {string}
 */
const runCmd = (cmd, { errorMessage = 'Skipping... {0}' } = {}) => {
  let stdout = '';

  try {
    stdout = execSync(cmd);
  } catch (e) {
    console.error(color.RED, errorMessage.replace('{0}', e.message), color.NOCOLOR);
  }

  return stdout.toString();
};

/**
 * Optionally commit CHANGELOG.md, package.json
 *
 * @param {*|string} version
 * @param {object} options
 * @param {string} options.contextPath
 * @returns {string}
 */
const commitFiles = (version, { contextPath = CONTEXT_PATH } = {}) =>
  runCmd(
    `git add ${join(contextPath, 'package.json')} ${join(contextPath, 'CHANGELOG.md')} && git commit ${join(
      contextPath,
      'package.json'
    )} ${join(contextPath, 'CHANGELOG.md')} -m "chore(release): ${version}"`,
    'Skipping release commit... {0}'
  );

/**
 * Get current package.json version
 *
 * @param {object} options
 * @param {string} options.contextPath
 * @returns {*}
 */
const getCurrentVersion = ({ contextPath = CONTEXT_PATH } = {}) => {
  const { version } = require(join(contextPath, 'package.json'));
  return version;
};

/**
 * Get last release commit hash
 *
 * @returns {string}
 */
const getReleaseCommit = () =>
  runCmd('git log --grep="chore(release)" --pretty=oneline -1', 'Skipping release commit check... {0}');

/**
 * Get the repositories remote
 *
 * @param {object} params
 * @param {string} params.commitPath
 * @param {string} params.prPath
 * @param {string} params.remoteUrl
 * @returns {{baseUrl: string, prUrl, commitUrl}}
 */
const getRemoteUrls = ({ commitPath, prPath, remoteUrl } = {}) => {
  const setUrl = remoteUrl || runCmd('git remote get-url origin', 'Skipping remote path check... {0}');
  let updatedUrl;
  let commitUrl;
  let prUrl;

  if (/^http/.test(setUrl)) {
    updatedUrl = setUrl.trim().replace(/(\.git)$/, '');
    commitUrl = join(updatedUrl, commitPath);
    prUrl = join(updatedUrl, prPath);
  }

  return {
    baseUrl: updatedUrl,
    commitUrl,
    prUrl
  };
};

/**
 * Return output for a range of commits from a hash
 *
 * @param {object} options
 * @param {Function} options.getReleaseCommit
 * @returns {string}
 */
const getGit = ({ getReleaseCommit: getAliasReleaseCommit = getReleaseCommit } = {}) => {
  const releaseCommitHash = getAliasReleaseCommit().split(/\s/)[0];

  if (!releaseCommitHash) {
    return runCmd(`git log --pretty=oneline`, 'Skipping commit "get" check... {0}');
  }

  return runCmd(`git log ${releaseCommitHash}..HEAD --pretty=oneline`, 'Skipping commit "get" check... {0}');
};

/**
 * Determine if override version is valid semver and return
 *
 * @param {string|*} version
 * @return {{clean: string, version: string}}
 */
const getOverrideVersion = version => {
  let updatedVersion;
  let clean;

  try {
    clean = semverClean(version);
  } catch (e) {
    console.error(color.RED, `Semver: ${e.message}`, color.NOCOLOR);
  }

  if (clean) {
    updatedVersion = version;
  }

  return {
    version: updatedVersion,
    clean
  };
};

/**
 * Set package.json version using npm version
 *
 * @param {'major'|'minor'|'patch'|*} versionBump
 * @param {object} options
 * @param {Function} options.getCurrentVersion
 * @returns {string}
 */
const getVersion = (versionBump, { getCurrentVersion: getAliasCurrentVersion = getCurrentVersion } = {}) => {
  const currentVersion = getAliasCurrentVersion() || '';
  let version;
  let clean;

  try {
    version = semverInc(currentVersion, versionBump || '');
    clean = semverClean(version);
  } catch (e) {
    console.error(color.RED, `Semver: ${e.message}`, color.NOCOLOR);
  }

  return {
    version,
    clean
  };
};

module.exports = {
  commitFiles,
  getGit,
  getOverrideVersion,
  getReleaseCommit,
  getRemoteUrls,
  getVersion,
  runCmd
};
