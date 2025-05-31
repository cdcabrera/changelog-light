const { color, OPTIONS } = require('./global');
const { commitFiles, getOverrideVersion, getVersion } = require('./cmds');
const { parseCommits, semverBump } = require('./parse');
const { updateChangelog, updatePackage } = require('./files');

/**
 * Start `changelog` updates
 *
 * @module Init
 */

/**
 * Updates changelog and package.json files based on commit history.
 *
 * This function analyzes commit messages, determines the appropriate semantic version bump,
 * updates the changelog with formatted commit messages, and optionally commits the changes.
 *
 * @param {object} options - Configuration options for the changelog update
 * @param {string} options.changelogFile - Path to the changelog file
 * @param {string} options.contextPath - Base directory path for operations
 * @param {boolean} options.isCommit - Whether to commit changes to git
 * @param {boolean} options.isDryRun - Whether to perform a dry run without writing files
 * @param {string} options.overrideVersion - Optional version to use instead of calculated version
 * @param {object} settings - Function overrides for testing or customization
 * @param {commitFiles} settings.commitFiles - Function to commit changes to git
 * @param {getOverrideVersion} settings.getOverrideVersion - Function to get the override version
 * @param {getVersion} settings.getVersion - Function to calculate the new version
 * @param {parseCommits} settings.parseCommits - Function to parse commit messages
 * @param {semverBump} settings.semverBump - Function to determine semantic version bump
 * @param {updateChangelog} settings.updateChangelog - Function to update the changelog file
 * @param {updatePackage} settings.updatePackage - Function to update the package.json file
 * @returns {{parsedCommits: {"Bug Fixes": {commits: string[], title: string}, Chores: {commits: string[],
 *     title: string}, Features: {commits: string[], title: string}}, semverBump: ("major"|"minor"|"patch"),
 *     package: string, versionClean: string, changelog: string, semverWeight: number, version: string}} Result of the changelog update
 */
const commitChangelog = (
  { changelogFile, contextPath, isCommit, isDryRun, overrideVersion } = OPTIONS,
  {
    commitFiles: commitAliasFiles = commitFiles,
    getOverrideVersion: getAliasOverrideVersion = getOverrideVersion,
    getVersion: getAliasVersion = getVersion,
    parseCommits: parseAliasCommits = parseCommits,
    semverBump: semverAliasBump = semverBump,
    updateChangelog: updateAliasChangelog = updateChangelog,
    updatePackage: updateAliasPackage = updatePackage
  } = {}
) => {
  if (process.env.NODE_ENV !== 'test') {
    process.chdir(contextPath);
  }

  const { commits, isBreakingChanges } = parseAliasCommits();
  const { bump, weight } = semverAliasBump({ commits, isBreakingChanges });
  const { clean: cleanVersion, version } = (overrideVersion && getAliasOverrideVersion()) || getAliasVersion(bump);

  if (isDryRun) {
    console.info(
      color.CYAN,
      `\nDry run ${changelogFile} output...\nVersion: ${version}\nSemver bump: ${bump}\nSemver weight: ${weight}`
    );
  }

  const changelog = updateAliasChangelog({ commits, packageVersion: cleanVersion, isBreakingChanges });
  const packageJSON = updateAliasPackage((overrideVersion && cleanVersion) || bump);

  if (isCommit && !isDryRun) {
    commitAliasFiles(cleanVersion);
  }

  if (isDryRun) {
    console.info(color.NOCOLOR);
  }

  return {
    changelog,
    package: packageJSON,
    parsedCommits: commits,
    semverBump: bump,
    semverWeight: weight,
    version,
    versionClean: cleanVersion
  };
};

module.exports = { commitChangelog, OPTIONS };
