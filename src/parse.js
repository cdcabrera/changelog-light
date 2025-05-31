const { generalCommitType, conventionalCommitType, OPTIONS } = require('./global');
const { getGit, getReleaseCommit, getLinkUrls } = require('./cmds');

/**
 * Parse and format commit messages
 *
 * @module Parse
 */

/**
 * Retrieves and combines conventional commit types with optional support for non-conventional commits.
 *
 * This function returns the standard conventional commit types from the 'conventional-commit-types'
 * package and optionally includes a general catch-all type for non-conventional commits.
 * The result is used to categorize and process commit messages throughout the application.
 *
 * @param {object} options - Configuration options
 * @param {boolean} options.isAllowNonConventionalCommits - Whether to include the general commit type for non-conventional commits
 * @returns {{
 *     feat:{description:string, title:string, value:string},
 *     fix:{description:string, title:string, value:string},
 *     chore:{description:string, title:string, value:string,
 *     general:({description:string, title:string, value:string}|undefined)}
 *     }} Combined commit types
 */
const getCommitType = ({ isAllowNonConventionalCommits } = OPTIONS) => ({
  ...conventionalCommitType,
  ...(isAllowNonConventionalCommits && generalCommitType)
});

/**
 * Retrieves the commit hashes for generating comparison links in the changelog.
 *
 * This function finds the hash of the last release commit and the most recent commit
 * in the current branch. These hashes are used to create comparison links in the
 * changelog that show all changes between releases.
 *
 * @param {object} settings - Function overrides for customization
 * @param {getGit} settings.getGit - Function to get all commits
 * @param {getReleaseCommit} settings.getReleaseCommit - Function to get the last release commit
 * @returns {{first:(string|null), last:(string|null)}} Commit hashes for comparison
 */
const getComparisonCommitHashes = ({
  getGit: getAliasGit = getGit,
  getReleaseCommit: getAliasReleaseCommit = getReleaseCommit
} = {}) => {
  const releaseCommitHash = getAliasReleaseCommit().split(/\s/)[0];
  const rest = getAliasGit()
    .map(({ commit }) => commit.trim().split(/\s/)[0])
    .reverse();

  return {
    first: releaseCommitHash || null,
    last: (releaseCommitHash && rest.pop()) || null
  };
};

/**
 * Parses a git commit message into structured components.
 *
 * This function extracts various parts of a commit message including the hash,
 * type, scope, description, and pull request number. It handles both conventional
 * commit format and non-conventional formats, falling back to a general type
 * for commits that don't follow the conventional format.
 *
 * @param {object} params - Parameters for parsing
 * @param {string} params.message - The raw commit message to parse
 * @param {boolean} params.isBreaking - Whether the commit contains breaking changes
 * @param {object} settings - Function overrides for customization
 * @param {getCommitType} settings.getCommitType - Function to get commit types
 * @returns {{
 *     hash:string,
 *     typeScope:(string|undefined),
 *     type:(string|undefined),
 *     scope:(string|undefined),
 *     description:(string|undefined),
 *     prNumber:(string|undefined),
 *     isBreaking:boolean
 *     }} Parsed commit message components
 */
const parseCommitMessage = (
  { message, isBreaking = false } = {},
  { getCommitType: getAliasCommitType = getCommitType } = {}
) => {
  const commitType = getAliasCommitType();
  let output;

  const [hashTypeScope, ...descriptionEtAll] = message.trim().split(/:/);
  const [description, ...partialPr] = descriptionEtAll.join(' ').trim().split(/\(#/);
  const [hash, ...typeScope] = hashTypeScope.replace(/!$/, '').trim().split(/\s/);
  const [type, scope = ''] = typeScope.join(' ').trim().split('(');

  output = {
    hash,
    typeScope: typeScope.join(' ').trim() || undefined,
    type: commitType?.[type]?.value || undefined,
    scope: scope.split(')')[0] || undefined,
    description: description.trim() || undefined,
    prNumber: (partialPr.join('(#').trim() || '').replace(/\D/g, '') || undefined,
    isBreaking
  };

  if (!output.type || (output.type && !descriptionEtAll?.length)) {
    const [hash, ...descriptionEtAll] = message.trim().split(/\s/);
    const [description, ...partialPr] = descriptionEtAll.join(' ').trim().split(/\(#/);

    output = {
      hash,
      typeScope: undefined,
      type: generalCommitType.general.value,
      scope: undefined,
      description: description.trim(),
      prNumber: (partialPr.join('(#').trim() || '').replace(/\D/g, ''),
      isBreaking
    };
  }

  return output;
};

/**
 * Format commit message for CHANGELOG.md
 *
 * @param {object} params
 * @param {string} params.scope
 * @param {string} params.description
 * @param {string|number|*} params.prNumber
 * @param {string} params.hash
 * @param {boolean} params.isBreaking
 * @param {object} options
 * @param {boolean} options.isBasic
 * @param {object} settings
 * @param {getLinkUrls} settings.getLinkUrls
 * @returns {string}
 */
const formatChangelogMessage = (
  { scope, description, prNumber, hash, isBreaking } = {},
  { isBasic } = OPTIONS,
  { getLinkUrls: getAliasLinkUrls = getLinkUrls } = {}
) => {
  const { commitUrl, prUrl } = getAliasLinkUrls();
  let output;

  const updatedBreaking = (isBreaking && '\u26A0 ') || '';
  const updatedScope = (scope && `**${scope}**`) || '';
  let updatedPr = (prNumber && `(#${prNumber})`) || '';
  let updatedHash = (hash && `(${hash.substring(0, 7)})`) || '';

  if (!isBasic && prUrl && updatedPr) {
    updatedPr = `([#${prNumber}](${new URL(prNumber, prUrl).href}))`;
  }

  if (!isBasic && commitUrl && updatedHash) {
    updatedHash = `([${hash.substring(0, 7)}](${new URL(hash, commitUrl).href}))`;
  }

  output = `* ${updatedBreaking}${updatedScope} ${description || hash} ${updatedPr} ${updatedHash}`;

  return output;
};

/**
 * Return an object of commit groupings based on "conventional-commit-types"
 *
 * @param {object} settings
 * @param {getCommitType} settings.getCommitType
 * @param {getGit} settings.getGit
 * @param {formatChangelogMessage} settings.formatChangelogMessage
 * @param {parseCommitMessage} settings.parseCommitMessage
 * @returns {{'Bug Fixes': {commits: string[], title: string}, Chores: {commits: string[],
 *     title: string}, Features: {commits: string[], title: string}}}
 */
const parseCommits = ({
  getCommitType: getAliasCommitType = getCommitType,
  getGit: getAliasGit = getGit,
  formatChangelogMessage: formatAliasChangelogMessage = formatChangelogMessage,
  parseCommitMessage: parseAliasCommitMessage = parseCommitMessage
} = {}) => {
  const commitType = getAliasCommitType();
  let isBreakingChanges = false;

  const commits = getAliasGit()
    .map(({ commit: message, isBreaking }) => {
      if (isBreaking === true) {
        isBreakingChanges = true;
      }
      return parseAliasCommitMessage({ message, isBreaking });
    })
    .filter(obj => obj.type in commitType)
    .map(obj => ({ ...obj, typeLabel: obj.type }))
    .reduce((groups, { typeLabel, ...messageProps }) => {
      const updatedGroups = groups;

      if (!updatedGroups[typeLabel]) {
        updatedGroups[typeLabel] = {
          ...commitType[typeLabel],
          commits: []
        };
      }

      updatedGroups[typeLabel].commits.push(formatAliasChangelogMessage({ typeLabel, ...messageProps }));

      return updatedGroups;
    }, {});

  return {
    commits,
    isBreakingChanges
  };
};

/**
 * Apply a clear weight to commit types, determine MAJOR, MINOR, PATCH
 *
 * @param {object} params
 * @param {{ feat: { commits: Array }, refactor: { commits: Array }, fix: { commits: Array } }} params.commits
 * @param {boolean} params.isBreakingChanges Apply a 'major' weight if true
 * @param {object} options
 * @param {boolean} options.isOverrideVersion
 * @param {object} settings
 * @param {getCommitType} settings.getCommitType
 * @returns {{bump: ('major'|'minor'|'patch'), weight: number}}
 */
const semverBump = (
  { commits: parsedCommits = {}, isBreakingChanges = false } = {},
  { isOverrideVersion = false } = OPTIONS,
  { getCommitType: getAliasCommitType = getCommitType } = {}
) => {
  const commitType = getAliasCommitType();
  let weight = 0;

  if (isBreakingChanges === true) {
    weight += 100;
  }

  Object.entries(parsedCommits).forEach(([key, { commits = [] }]) => {
    switch (key) {
      case commitType?.feat?.value:
      case commitType?.['revert']?.value:
        weight += 10 * commits.length;
        break;
      case commitType?.refactor?.value:
        weight += commits.length;
        break;
      default:
        weight += 0.1 * commits.length;
        break;
    }
  });

  return {
    bump: (isOverrideVersion && 'override') || (weight >= 100 && 'major') || (weight >= 10 && 'minor') || 'patch',
    weight
  };
};

module.exports = {
  getCommitType,
  getComparisonCommitHashes,
  formatChangelogMessage,
  parseCommitMessage,
  parseCommits,
  semverBump
};
