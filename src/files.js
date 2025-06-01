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
 * Updates the CHANGELOG.md file with formatted commit messages.
 *
 * This function reads the existing changelog file (if it exists), adds a new section with
 * the current version and formatted commit messages, and writes the updated content back to the file.
 *
 * Note: Future enhancement - syntax for the comparison can include the use of caret.
 * Review using caret against a release commit for determining range.
 *
 * @param {object} [params={}] - Parameters for changelog generation
 * @param {{ feat: { commits: Array },
 *     refactor: { commits: Array },
 *     fix: { commits: Array } }} [params.commits={}] - Parsed commit messages grouped by type
 * @param {boolean} [params.isBreakingChanges=false] - Whether breaking changes are included (applies a 'major' weight if true)
 * @param {string} params.packageVersion - Version to display in the changelog
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {string} options.changelogPath - Path to the changelog file
 * @param {string} options.date - Date to use for the release (defaults to current date)
 * @param {boolean} [options.isBasic=false] - Whether to use basic formatting without links
 * @param {boolean} [options.isDryRun=false] - Whether to perform a dry run without writing files
 * @param {string} options.releaseDescription - Optional description for the release
 * @param {object} [settings={}] - Function and value overrides for customization
 * @param {string} settings.breakingChangeReleaseDesc - Text to display for breaking changes
 * @param {string} settings.fallbackPackageVersion - Fallback version if packageVersion is not provided
 * @param {getComparisonCommitHashes} settings.getComparisonCommitHashes - Function to get commit hashes for comparison links
 * @param {getLinkUrls} settings.getLinkUrls - Function to get URLs for links
 * @param {string} settings.headerMd - Markdown header for the changelog file
 * @returns {string} The updated changelog content
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
  const updatedReleaseDescription = releaseDescription || '';
  const updatedBreakingChanges = (isBreakingChanges && breakingChangeReleaseDesc) || '';
  const fullReleaseDescription =
    (updatedBreakingChanges &&
      updatedReleaseDescription &&
      `${updatedBreakingChanges}\n\n${updatedReleaseDescription}`) ||
    `${updatedBreakingChanges}${updatedReleaseDescription}`;

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

  const updatedBody = `## ${version} (${systemTimestamp})\n${fullReleaseDescription}\n${displayCommits}`;
  const output = `${header}\n\n${updatedBody}\n${body}${(body && '\n') || ''}`;

  if (isDryRun) {
    console.info(`\n${updatedBody}`);
  } else {
    writeFileSync(changelogPath, output);
  }

  return output;
};

/**
 * Updates the package.json file with a new version based on the specified semantic version bump.
 *
 * This function uses npm's version command to update the version field in package.json
 * without creating a git tag. It can perform a dry run to preview the changes without
 * modifying the file.
 *
 * @param {'major'|'minor'|'patch'|string} versionBump - Type of semantic version bump or specific version
 * @param {object} [options=OPTIONS] - Configuration options
 * @param {boolean} [options.isDryRun=false] - Whether to perform a dry run without writing files
 * @param {string} options.packagePath - Path to the package.json file
 * @returns {string} A message indicating the version bump that was applied
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
