const { execSync } = require('child_process');
const { join } = require('path');
const semverClean = require('semver/functions/clean');
const semverInc = require('semver/functions/inc');
const { logger, OPTIONS } = require('./global');

/**
 * Functions for `git`, `package.json` version, and more
 *
 * @module Commands
 */

/**
 * Execute a command
 *
 * @param {string} cmd
 * @param {object} settings
 * @param {string} settings.errorMessage
 * @param {object} settings.logger
 * @returns {string}
 */
const runCmd = (cmd, { errorMessage = 'Skipping... {0}', logger: loggerAlias = logger } = {}) => {
  let stdout = '';

  try {
    stdout = execSync(cmd);
  } catch (e) {
    loggerAlias.error(errorMessage.replace('{0}', e.message), { displayNow: true });
  }

  return stdout.toString();
};

/**
 * Optionally commit CHANGELOG.md, package.json
 *
 * @param {*|string} version
 * @param {object} options
 * @param {string} options.changelogPath
 * @param {string} options.packagePath
 * @param {string[]|string} options.releaseTypeScope
 * @returns {string}
 */
const commitFiles = (version, { changelogPath, packagePath, releaseTypeScope } = OPTIONS) => {
  const isArray = Array.isArray(releaseTypeScope);

  return runCmd(
    `git add ${packagePath} ${changelogPath} && git commit ${packagePath} ${changelogPath} -m "${
      (isArray && releaseTypeScope?.[0]) || releaseTypeScope
    }: ${version}"`,
    'Skipping release commit... {0}'
  );
};

/**
 * Get current package.json version
 *
 * @param {object} options
 * @param {string} options.packagePath
 * @returns {*}
 */
const getCurrentVersion = ({ packagePath } = OPTIONS) => {
  const { version } = require(packagePath);
  return version;
};

/**
 * Get last release commit hash
 *
 * @param {object} options
 * @param {string[]|string} options.releaseTypeScope
 * @returns {string}
 */
const getReleaseCommit = ({ releaseTypeScope } = OPTIONS) => {
  const isArray = Array.isArray(releaseTypeScope);

  return runCmd(
    `git log --grep="${
      (isArray && releaseTypeScope?.[1]) || (isArray && releaseTypeScope?.[0]) || releaseTypeScope
    }" --pretty=oneline -1`,
    'Skipping release commit check... {0}'
  );
};

/**
 * Get the repositories remote
 *
 * @param {object} options
 * @param {string} options.commitPath
 * @param {string} options.comparePath
 * @param {string} options.prPath
 * @param {string} options.remoteUrl
 * @param {object} settings
 * @param {object} settings.logger
 * @returns {{baseUrl: string, prUrl, commitUrl}}
 */
const getRemoteUrls = (
  { commitPath, comparePath, prPath, remoteUrl } = OPTIONS,
  { logger: loggerAlias = logger } = {}
) => {
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
 * @param {object} settings
 * @param {object} settings.logger
 * @returns {{clean: string, version: string}}
 */
const getOverrideVersion = ({ overrideVersion: version } = OPTIONS, { logger: loggerAlias = logger } = {}) => {
  let updatedVersion;
  let clean;

  try {
    clean = semverClean(version);
  } catch (e) {
    loggerAlias.error(`getOverrideVersion: ${e.message}`, { displayNow: true });
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
 * @param {object} settings.logger
 * @returns {string}
 */
const getVersion = (
  versionBump,
  { getCurrentVersion: getAliasCurrentVersion = getCurrentVersion, logger: loggerAlias = logger } = {}
) => {
  const currentVersion = getAliasCurrentVersion() || '';
  let version;
  let clean;

  try {
    version = semverInc(currentVersion, versionBump || '');
    clean = semverClean(version);
  } catch (e) {
    loggerAlias.error(`getVersion: ${e.message}`, { displayNow: true });
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
