const { dirname } = require('path');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { OPTIONS } = require('./global');
const { getLinkUrls, runCmd } = require('./cmds');
const { getComparisonCommitHashes } = require('./parse');

/**
 * Update `changelog` and `package.json`
 *
 * @module Files
 */

/**
 * ToDo: syntax for the comparison can include the use of caret
 * Review using caret vs a release commit for determining range
 */
/**
 * Update CHANGELOG.md with commit output.
 *
 * @param {object} params
 * @param {{ feat: { commits: Array }, refactor: { commits: Array }, fix: { commits: Array } }} params.commits
 * @param {boolean} params.isBreakingChanges Apply a 'major' weight if true
 * @param {*|string} params.packageVersion
 * @param {object} options
 * @param {string} options.changelogPath
 * @param {string} options.date
 * @param {boolean} options.isBasic
 * @param {boolean} options.isDryRun
 * @param {string} options.releaseDescription
 * @param {object} settings
 * @param {string} settings.breakingChangeReleaseDesc
 * @param {string} settings.fallbackPackageVersion
 * @param {Function} settings.getComparisonCommitHashes
 * @param {Function} settings.getLinkUrls
 * @param {string} settings.headerMd
 * @returns {string}
 */
const updateChangelog = (
  { commits: parsedCommits = {}, isBreakingChanges = false, packageVersion } = {},
  { date, changelogPath, isBasic = false, isDryRun = false, releaseDescription } = OPTIONS,
  {
    breakingChangeReleaseDesc = `\u26A0 BREAKING CHANGES`,
    fallbackPackageVersion = '¯\\_(ツ)_/¯',
    getComparisonCommitHashes: getAliasComparisonCommitHashes = getComparisonCommitHashes,
    getLinkUrls: getAliasLinkUrls = getLinkUrls,
    headerMd = `# Changelog\nAll notable changes to this project will be documented in this file.`
  } = {}
) => {
  const systemTimestamp = ((date && new Date(date)) || new Date()).toLocaleDateString('fr-CA', {
    timeZone: 'UTC'
  });
  const { compareUrl } = getAliasLinkUrls();
  const updatedReleaseDescription = releaseDescription || (isBreakingChanges && breakingChangeReleaseDesc) || '';
  let header = headerMd;
  let version = fallbackPackageVersion;
  let body = '';

  if (existsSync(changelogPath)) {
    const [tempHeader, ...tempBody] = readFileSync(changelogPath, 'utf-8').split('##');
    header = tempHeader.trim();
    body = (tempBody.length && `## ${tempBody.join('##').trim()}`) || body;
  } else if (!isDryRun) {
    writeFileSync(changelogPath, '');
  }

  const displayCommits = Object.values(parsedCommits)
    .sort(({ title: titleA }, { title: titleB }) => titleB.localeCompare(titleA))
    .reduce((str, { title, commits = [] }) => `${str}\n### ${title}\n${commits.join('\n')}\n`, '');

  if (packageVersion) {
    version = packageVersion;

    if (!isBasic && compareUrl) {
      const { first, last } = getAliasComparisonCommitHashes();
      if (first && last) {
        version = `[${version}](${compareUrl}${first}...${last})`;
      }
    }
  }

  const updatedBody = `## ${version} (${systemTimestamp})\n${updatedReleaseDescription}\n${displayCommits}`;
  const output = `${header}\n\n${updatedBody}\n${body}${(body && '\n') || ''}`;

  if (isDryRun) {
    console.info(`\n${updatedBody}`);
  } else {
    writeFileSync(changelogPath, output);
  }

  return output;
};

/**
 * Apply bump and update package.json
 *
 * @param {'major'|'minor'|'patch'|*} versionBump
 * @param {object} options
 * @param {boolean} options.isDryRun
 * @param {string} options.packagePath
 * @returns {string}
 */
const updatePackage = (versionBump, { isDryRun = false, packagePath } = OPTIONS) => {
  const output = `Version bump: ${versionBump}`;
  const directory = dirname(packagePath);

  if (!isDryRun) {
    runCmd(
      `(cd ${directory} && npm version ${versionBump} --git-tag-version=false)`,
      'Skipping package.json version... {0}'
    );
  }

  return output;
};

module.exports = {
  updateChangelog,
  updatePackage
};
