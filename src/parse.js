const { generalCommitType, conventionalCommitType, OPTIONS } = require('./global');
const { getGit, getReleaseCommit, getRemoteUrls } = require('./cmds');

/**
 * Aggregate conventional commit types. Optionally allow non-conventional commit types.
 *
 * @param {object} options
 * @param {boolean} options.isAllowNonConventionalCommits
 * @return {{fix: {description: string, title: string, value: string}, chore: {description: string,
 *     title: string, value: string}, feat: {description: string, title: string, value: string}}}
 */
const getCommitType = ({ isAllowNonConventionalCommits } = OPTIONS) => ({
  ...conventionalCommitType,
  ...(isAllowNonConventionalCommits && generalCommitType)
});

/**
 * In the current context, get the first and last commits based on the last release commit message.
 *
 * @param {object} settings
 * @param {Function} settings.getGit
 * @param {Function} settings.getReleaseCommit
 * @returns {{last: string, first: string}}
 */
const getComparisonCommitHashes = ({
  getGit: getAliasGit = getGit,
  getReleaseCommit: getAliasReleaseCommit = getReleaseCommit
} = {}) => {
  const releaseCommitHash = getAliasReleaseCommit().split(/\s/)[0];
  const rest = getAliasGit()
    .trim()
    .split(/\n/g)
    .map(value => value.trim().split(/\s/)[0])
    .reverse();

  return {
    first: releaseCommitHash || null,
    last: (releaseCommitHash && rest.pop()) || null
  };
};

/**
 * Parse a commit message
 *
 * @param message
 * @param {object} settings
 * @param {Function} settings.getCommitType
 * @returns {{description: string, type: string, prNumber: string, hash: *}|{scope: string, description: string,
 *     type: string, prNumber: string, hash: string, typeScope: string}}
 */
const parseCommitMessage = (message, { getCommitType: getAliasCommitType = getCommitType } = {}) => {
  const commitType = getAliasCommitType();
  let output;

  const [hashTypeScope, ...descriptionEtAll] = message.trim().split(/:/);
  const [description, ...partialPr] = descriptionEtAll.join(' ').trim().split(/\(#/);
  const [hash, typeScope = ''] = hashTypeScope.trim().split(/\s/);
  const [type, scope = ''] = typeScope.split('(');

  output = {
    hash,
    typeScope,
    type: commitType?.[type]?.value,
    scope: scope.split(')')[0],
    description: description,
    prNumber: (partialPr.join('(#').trim() || '').replace(/\D/g, '')
  };

  if (!output.typeScope || !output.type || !output.scope) {
    const [hash, ...descriptionEtAll] = message.trim().split(/\s/);
    const [description, ...partialPr] = descriptionEtAll.join(' ').trim().split(/\(#/);

    output = {
      hash,
      typeScope: undefined,
      type: generalCommitType.general.value,
      scope: undefined,
      description: description,
      prNumber: (partialPr.join('(#').trim() || '').replace(/\D/g, '')
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
 * @param {object} options
 * @param {boolean} options.isBasic
 * @param {object} settings
 * @param {Function} settings.getRemoteUrls
 * @returns {string}
 */
const formatChangelogMessage = (
  { scope, description, prNumber, hash } = {},
  { isBasic } = OPTIONS,
  { getRemoteUrls: getAliasRemoteUrls = getRemoteUrls } = {}
) => {
  const { commitUrl, prUrl } = getAliasRemoteUrls();
  let output;

  const updatedScope = (scope && `**${scope}**`) || '';
  let updatedPr = (prNumber && `(#${prNumber})`) || '';
  let updatedHash = (hash && `(${hash.substring(0, 7)})`) || '';

  if (!isBasic && prUrl && updatedPr) {
    updatedPr = `([#${prNumber}](${new URL(prNumber, prUrl).href}))`;
  }

  if (!isBasic && commitUrl && updatedHash) {
    updatedHash = `([${hash.substring(0, 7)}](${new URL(hash, commitUrl).href}))`;
  }

  output = `* ${updatedScope} ${description} ${updatedPr} ${updatedHash}`;

  return output;
};

/**
 * Return an object of commit groupings based on "conventional-commit-types"
 *
 * @param {object} settings
 * @param {Function} settings.getCommitType
 * @param {Function} settings.getGit
 * @param {Function} settings.formatChangelogMessage
 * @param {Function} settings.parseCommitMessage
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

  return getAliasGit()
    .trim()
    .split(/\n/g)
    .map(message => parseAliasCommitMessage(message))
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
};

/**
 * Apply a clear weight to commit types, determine MAJOR, MINOR, PATCH
 *
 * @param {{ feat: { commits: Array }, refactor: { commits: Array }, fix: { commits: Array } }} parsedCommits
 * @param {object} options
 * @param {boolean} options.isOverrideVersion
 * @param {object} settings
 * @param {Function} settings.getCommitType
 * @returns {{bump: ('major'|'minor'|'patch'), weight: number}}
 */
const semverBump = (
  parsedCommits = {},
  { isOverrideVersion = false } = OPTIONS,
  { getCommitType: getAliasCommitType = getCommitType } = {}
) => {
  const commitType = getAliasCommitType();
  let weight = 0;

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
