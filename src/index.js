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
 * Set changelog and package.
 *
 * @param {object} options
 * @param {string} options.changelogFile
 * @param {string} options.contextPath
 * @param {boolean} options.isCommit
 * @param {boolean} options.isDryRun
 * @param {string} options.overrideVersion
 * @param {object} settings
 * @param {Function} settings.commitFiles
 * @param {Function} settings.getOverrideVersion
 * @param {Function} settings.getVersion
 * @param {Function} settings.parseCommits
 * @param {Function} settings.semverBump
 * @param {Function} settings.updateChangelog
 * @param {Function} settings.updatePackage
 * @returns {{parsedCommits: {"Bug Fixes": {commits: string[], title: string}, Chores: {commits: string[],
 *     title: string}, Features: {commits: string[], title: string}}, semverBump: ("major"|"minor"|"patch"),
 *     package: string, versionClean: *, changelog: string, semverWeight: number, version: *}}
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

  const parsedCommits = parseAliasCommits();
  const { bump, weight } = semverAliasBump(parsedCommits);
  const { clean: cleanVersion, version } = (overrideVersion && getAliasOverrideVersion()) || getAliasVersion(bump);

  if (isDryRun) {
    console.info(
      color.CYAN,
      `\nDry run ${changelogFile} output...\nVersion: ${version}\nSemver bump: ${bump}\nSemver weight: ${weight}`
    );
  }

  const changelog = updateAliasChangelog(parsedCommits, cleanVersion);
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
    parsedCommits,
    semverBump: bump,
    semverWeight: weight,
    version,
    versionClean: cleanVersion
  };
};

module.exports = { commitChangelog, OPTIONS };
