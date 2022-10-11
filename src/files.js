const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { runCmd } = require('./cmds');
const { _COMMIT_CHANGELOG_CONTEXT_PATH: CONTEXT_PATH } = global;

/**
 * Update CHANGELOG.md with commit output.
 *
 * @param {object} parsedCommits
 * @param {*|string} packageVersion
 * @param {object} options
 * @param {string} options.fallbackPackageVersion
 * @param {string} options.filePath
 * @param {boolean} options.isDryRun
 * @returns {string}
 */
const updateChangelog = (
  parsedCommits = {},
  packageVersion,
  {
    date,
    fallbackPackageVersion = '¯\\_(ツ)_/¯',
    filePath = join(CONTEXT_PATH, `/CHANGELOG.md`),
    isDryRun = false
  } = {}
) => {
  const systemTimestamp = ((date && new Date(date)) || new Date()).toLocaleDateString('fr-CA', {
    timeZone: 'UTC'
  });
  let header = `# Changelog\nAll notable changes to this project will be documented in this file.`;
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
  const updatedBody = `## ${packageVersion || fallbackPackageVersion} (${systemTimestamp})\n${displayCommits}`;
  const output = `${header}\n${updatedBody}\n${body}`;

  if (isDryRun) {
    console.info(`\n${output}`);
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
const updatePackage = (versionBump, { isDryRun = false } = {}) => {
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
