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
 * Executes a shell command and handles any errors that occur.
 *
 * This function wraps Node's execSync to provide consistent error handling
 * and output formatting for all command executions in the application.
 *
 * @param {string} cmd - The shell command to execute
 * @param {object} [settings={}] - Configuration options
 * @param {string} [settings.errorMessage='Skipping... {0}'] - Error message template (use {0} for the error message)
 * @returns {string} The command output as a string
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
 * Commits changes to CHANGELOG.md, package.json, and optionally package-lock.json.
 *
 * This function stages the specified files and creates a commit with a message
 * that includes the release type and version. It handles both string and array
 * formats for the release type scope.
 *
 * @param {string} version - The version being released
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string} options.changelogPath - Path to the changelog file
 * @param {string} options.packagePath - Path to the package.json file
 * @param {string} options.lockFilePath - Optional path to the package-lock.json file
 * @param {Array<string>|string} options.releaseTypeScope - Release type for the commit message (e.g., "chore", "feat")
 * @returns {string} The output from the git commit command
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
 * Retrieves the current version from package.json.
 *
 * This function reads the package.json file at the specified path
 * and returns the version field value.
 *
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string} options.packagePath - Path to the package.json file
 * @returns {string} The current version string from package.json
 */
const getCurrentVersion = ({ packagePath } = OPTIONS) => {
  const { version } = require(packagePath);

  return version;
};

/**
 * Retrieves the hash of the last release commit.
 *
 * This function searches the git history for commits matching the specified
 * release type scope pattern and returns the most recent one. It can be
 * restricted to a specific branch if provided.
 *
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {Array<string>|string} options.releaseTypeScope - Pattern to match in commit messages for identifying releases
 * @param {string|undefined} options.releaseBranch - Optional branch to restrict the search to
 * @returns {string} The hash and message of the last release commit
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
 * Generates URLs for linking to commits, comparisons, and pull requests in the changelog.
 *
 * This function takes the repository URL (either provided or fetched from git)
 * and constructs various URLs for linking to different resources in the changelog.
 * It handles formatting and ensures all URLs end with a trailing slash.
 *
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string} options.commitPath - Path segment for commit URLs (e.g., "commit")
 * @param {string} options.comparePath - Path segment for comparison URLs (e.g., "compare")
 * @param {string} options.linkUrl - Optional explicit repository URL (falls back to git remote)
 * @param {string} options.prPath - Path segment for pull request URLs (e.g., "pull")
 * @returns {{baseUrl: string, commitUrl: string, compareUrl: string, prUrl: string }}
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
 * Retrieves and processes git commits since the last release.
 *
 * This function gets all commits since the last release and identifies breaking changes
 * by examining commit messages for specific patterns. It supports two types of breaking
 * change indicators: message body syntax and scope type syntax.
 *
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string|undefined} options.releaseBranch - Optional branch to restrict the search to
 * @param {object} [settings={}] - Function and value overrides for customization
 * @param {getReleaseCommit} [settings.getReleaseCommit=getReleaseCommit] - Function to get the last release commit
 * @param {Array<string>} [settings.breakingChangeMessageFilter=['BREAKING CHANGE:', 'BREAKING CHANGES:']] - Patterns to identify breaking changes in commit messages
 * @param {Array<string>} [settings.breakingChangeScopeTypeFilter=[')!:', '!:']] - Patterns to identify breaking changes in commit scope/type
 * @returns {Array<{ commit: string, isBreaking: boolean }>} Array of commit objects with hash and breaking change flag
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
 * Validates and processes an override version string.
 *
 * This function checks if the provided override version is a valid semantic version
 * using semver's clean function. If valid, it returns both the original version string
 * and the cleaned version. If invalid, it logs an error and returns undefined values.
 *
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string} options.overrideVersion - The version string to validate and process
 * @returns {{ version:(string|undefined), clean:(string|undefined) }} The processed version information
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
 * Calculates a new version based on the current version and a semantic version bump.
 *
 * This function retrieves the current version from package.json and applies the specified
 * semantic version bump (major, minor, patch) using semver's increment function.
 * It returns both the formatted version string and a cleaned version string.
 *
 * @param {'major'|'minor'|'patch'|string} versionBump - Type of semantic version bump to apply
 * @param {object} [settings={}] - Function overrides for customization
 * @param {getCurrentVersion} settings.getCurrentVersion - Function to get the current version from package.json
 * @returns {{ version:(string|undefined), clean:(string|undefined) }} The new version information
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
