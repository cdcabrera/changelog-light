const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { OPTIONS } = require('./global');
const { getRemoteUrls, runCmd } = require('./cmds');
const { getComparisonCommitHashes } = require('./parse');

/**
 * ToDo: syntax for the comparison can include the use of caret
 * Review using caret vs a release commit for determining range
 */
/**
 * Update CHANGELOG.md with commit output.
 *
 * @param {object} parsedCommits
 * @param {*|string} packageVersion
 * @param {object} options
 * @param {string} options.date
 * @param {boolean} options.isDryRun
 * @param {object} settings
 * @param {string} settings.fallbackPackageVersion
 * @param {string} settings.filePath
 * @param {string} settings.headerMd

 * @returns {string}
 */
const updateChangelog = (
  parsedCommits = {},
  packageVersion,
  { date, isDryRun = false } = OPTIONS,
  {
    fallbackPackageVersion = '¯\\_(ツ)_/¯',
    filePath = join(OPTIONS.contextPath, `/CHANGELOG.md`),
    getComparisonCommitHashes: getAliasComparisonCommitHashes = getComparisonCommitHashes,
    getRemoteUrls: getAliasRemoteUrls = getRemoteUrls,
    headerMd = `# Changelog\nAll notable changes to this project will be documented in this file.`
  } = {}
) => {
  const systemTimestamp = ((date && new Date(date)) || new Date()).toLocaleDateString('fr-CA', {
    timeZone: 'UTC'
  });
  const { compareUrl } = getAliasRemoteUrls();
  let header = headerMd;
  let version = fallbackPackageVersion;
  let body = '';

  if (existsSync(filePath)) {
    const [tempHeader, ...tempBody] = readFileSync(filePath, 'utf-8').split('##');
    header = tempHeader;
    body = (tempBody.length && `## ${tempBody.join('##')}`) || body;
  } else {
    writeFileSync(filePath, '');
  }

  const displayCommits = Object.values(parsedCommits)
    .sort(({ title: titleA }, { title: titleB }) => titleB.localeCompare(titleA))
    .reduce((str, { title, commits = [] }) => `${str}\n### ${title}\n${commits.join('\n')}\n`, '');

  if (packageVersion) {
    version = packageVersion;

    if (compareUrl) {
      const { first, last } = getAliasComparisonCommitHashes();
      if (first && last) {
        version = `[${version}](${compareUrl}${first}...${last})`;
      }
    }
  }

  const updatedBody = `## ${version} (${systemTimestamp})\n${displayCommits}`;
  const output = `${header}\n${updatedBody}\n${body}`;

  if (isDryRun) {
    console.info(`\n${updatedBody}`);
  } else {
    writeFileSync(filePath, output);
  }

  return output;
};

/**
 * Apply bump and update package.json
 *
 * @param {'major'|'minor'|'patch'|*} versionBump
 * @param {object} options
 * @param {boolean} options.isDryRun
 * @returns {string}
 */
const updatePackage = (versionBump, { isDryRun = false } = OPTIONS) => {
  const output = `Version bump: ${versionBump}`;

  if (!isDryRun) {
    runCmd(`npm version ${versionBump} --git-tag-version=false`, 'Skipping package.json version... {0}');
  }

  return output;
};

module.exports = {
  updateChangelog,
  updatePackage
};
