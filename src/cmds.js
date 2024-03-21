const { execSync } = require('child_process');
const { join } = require('path');
const semverClean = require('semver/functions/clean');
const semverInc = require('semver/functions/inc');
const { color, OPTIONS } = require('./global');

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
 * @param {string} options.changelogPath
 * @param {string} options.packagePath
 * @param {string} options.lockFilePath
 * @param {string[]|string} options.releaseTypeScope
 * @returns {string}
 */
const commitFiles = (version, { changelogPath, packagePath, lockFilePath, releaseTypeScope } = OPTIONS) => {
  const isArray = Array.isArray(releaseTypeScope);
  const updatedLockFilePath = (lockFilePath && ` ${lockFilePath}`) || '';

  return runCmd(
    `git add ${packagePath} ${changelogPath}${updatedLockFilePath} && git commit ${packagePath} ${changelogPath}${updatedLockFilePath} -m "${
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
 * @param {string|undefined} options.releaseBranch
 * @returns {string}
 */
const getReleaseCommit = ({ releaseTypeScope, releaseBranch } = OPTIONS) => {
  const isArray = Array.isArray(releaseTypeScope);
  const updatedReleaseBranch = (releaseBranch && ` ${releaseBranch}`) || '';
  return runCmd(
    `git log${updatedReleaseBranch} --grep="${
      (isArray && releaseTypeScope?.[1]) || (isArray && releaseTypeScope?.[0]) || releaseTypeScope
    }" --pretty=oneline -1`,
    'Skipping release commit check... {0}'
  );
};

/**
 * Get the base url for links, and then set the multiple link formats for markdown.
 *
 * @param {object} options
 * @param {string} options.commitPath
 * @param {string} options.comparePath
 * @param {string} options.linkUrl
 * @param {string} options.prPath
 * @returns {{baseUrl: string, prUrl, commitUrl}}
 */
const getLinkUrls = ({ commitPath, comparePath, linkUrl, prPath } = OPTIONS) => {
  const setUrl = linkUrl || runCmd('git remote get-url origin', 'Skipping remote path check... {0}');
  let updatedUrl;
  let commitUrl;
  let compareUrl;
  let prUrl;

  if (/^http/.test(setUrl)) {
    updatedUrl = setUrl.trim().replace(/(\.git)$/, '');
    const [protocol, linkPath] = updatedUrl.split('://');
    const generateUrl = path => {
      let tempUrl = typeof path === 'string' && `${protocol}://${join(linkPath, path)}`;
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
 * @param {object} options
 * @param {string|undefined} options.releaseBranch
 * @param {object} settings
 * @param {Function} settings.getReleaseCommit
 * @param {Array} settings.breakingChangeMessageFilter
 * @param {Array} settings.breakingChangeScopeTypeFilter
 * @returns {Array}
 */
const getGit = (
  { releaseBranch } = OPTIONS,
  {
    getReleaseCommit: getAliasReleaseCommit = getReleaseCommit,
    breakingChangeMessageFilter = ['BREAKING CHANGE:', 'BREAKING CHANGES:'],
    breakingChangeScopeTypeFilter = [')!:', '!:']
  } = {}
) => {
  const releaseCommitHash = getAliasReleaseCommit().split(/\s/)[0];
  let breakingChangeMessageCommits;
  let breakingChangeScopeTypeCommits;
  let commits;

  /**
   * Build git log command
   *
   * - Filter a range of commits since the last release if it exists
   * - Filter breaking change commits with message body syntax
   * - Filter breaking change commits with scope type syntax. And apply an additional check to help filter out
   *     commits with message body scope type syntax used unintentionally.
   *
   * @param {string} commitHash
   * @param {Array} searchFilter
   * @returns {string}
   */
  const getGitLog = (commitHash, searchFilter) => {
    const releaseCommitHashRange = (commitHash && ` ${commitHash}..${releaseBranch}`) || '';
    const searchFilterCommits = searchFilter?.map(value => ` --grep="${value}"`).join(' ') || '';

    return runCmd(
      `git log${releaseCommitHashRange} --pretty=oneline${searchFilterCommits}`,
      'Skipping commit "get" check... {0}'
    );
  };

  breakingChangeMessageCommits = getGitLog(releaseCommitHash, breakingChangeMessageFilter);
  breakingChangeScopeTypeCommits = getGitLog(releaseCommitHash, breakingChangeScopeTypeFilter);
  commits = getGitLog(releaseCommitHash);

  breakingChangeMessageCommits = breakingChangeMessageCommits
    .trim()
    .split(/\n/g)
    ?.filter(value => value !== '');

  breakingChangeScopeTypeCommits = breakingChangeScopeTypeCommits
    .trim()
    .split(/\n/g)
    .filter(oneLineGitLogMessage => {
      let isBreaking = false;

      breakingChangeScopeTypeFilter?.forEach(filter => {
        if (oneLineGitLogMessage.indexOf(filter) > -1) {
          isBreaking = true;
        }
      });

      return isBreaking;
    })
    ?.filter(value => value !== '');

  return commits
    .trim()
    .split(/\n/g)
    .filter(value => value !== '')
    .map(commit => ({
      commit,
      isBreaking:
        [...breakingChangeMessageCommits, ...breakingChangeScopeTypeCommits].find(
          breakingChangeCommit => breakingChangeCommit === commit
        ) !== undefined
    }));
};

/**
 * Determine if override version is valid semver and return
 *
 * @param {object} options
 * @param {string|*} options.overrideVersion
 * @returns {{clean: string, version: string}}
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
  getLinkUrls,
  getOverrideVersion,
  getReleaseCommit,
  getVersion,
  runCmd
};
