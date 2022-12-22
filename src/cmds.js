const { execSync } = require('child_process');
const { join } = require('path');
const semverClean = require('semver/functions/clean');
const semverInc = require('semver/functions/inc');
const { color, OPTIONS } = require('./global');
/**
 * Execute a command
 *
 * @param {string} cmd
 * @param {object} settings
 * @param {string} settings.errorMessage
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
 * @param {string} options.releaseTypeScope
 * @returns {string}
 */
const commitFiles = (version, { contextPath, releaseTypeScope = 'chore(release)' } = OPTIONS) =>
  runCmd(
    `git add ${join(contextPath, 'package.json')} ${join(contextPath, 'CHANGELOG.md')} && git commit ${join(
      contextPath,
      'package.json'
    )} ${join(contextPath, 'CHANGELOG.md')} -m "${releaseTypeScope}: ${version}"`,
    'Skipping release commit... {0}'
  );

/**
 * Get current package.json version
 *
 * @param {object} options
 * @param {string} options.contextPath
 * @returns {*}
 */
const getCurrentVersion = ({ contextPath } = OPTIONS) => {
  const { version } = require(join(contextPath, 'package.json'));
  return version;
};

/**
 * Get last release commit hash
 *
 * @param {object} options
 * @param {string} options.releaseTypeScope
 * @returns {string}
 */
const getReleaseCommit = ({ releaseTypeScope = 'chore(release)' } = OPTIONS) =>
  runCmd(`git log --grep="${releaseTypeScope}" --pretty=oneline -1`, 'Skipping release commit check... {0}');

/**
 * Get the repositories remote
 *
 * @param {object} options
 * @param {string} options.commitPath
 * @param {string} options.comparePath
 * @param {string} options.prPath
 * @param {string} options.remoteUrl
 * @returns {{baseUrl: string, prUrl, commitUrl}}
 */
const getRemoteUrls = ({ commitPath, comparePath, prPath, remoteUrl } = OPTIONS) => {
  const setUrl = remoteUrl || runCmd('git remote get-url origin', 'Skipping remote path check... {0}');
  let updatedUrl;
  let commitUrl;
  let compareUrl;
  let prUrl;

  if (/^http/.test(setUrl)) {
    updatedUrl = setUrl.trim().replace(/(\.git)$/, '');
    const [protocol, remotePath] = updatedUrl.split('://');
    const generateUrl = path => {
      let tempUrl = typeof path === 'string' && `${protocol}://${join(remotePath, path)}`;
      if (tempUrl && !/\/$/.test(tempUrl)) {
        tempUrl += '/';
      }
      return tempUrl;
    };

    commitUrl = generateUrl(commitPath);
    compareUrl = generateUrl(comparePath);
    prUrl = generateUrl(prPath);
  }

  return {
    baseUrl: updatedUrl,
    commitUrl,
    compareUrl,
    prUrl
  };
};

/**
 * Return output for a range of commits from a hash
 *
 * @param {object} settings
 * @param {Function} settings.getReleaseCommit
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
 * @param {object} options
 * @param {string|*} options.overrideVersion
 * @return {{clean: string, version: string}}
 */
const getOverrideVersion = ({ overrideVersion: version } = OPTIONS) => {
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
 * @param {object} settings
 * @param {Function} settings.getCurrentVersion
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
