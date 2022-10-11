const commitTypes = require('conventional-commit-types');
const { color } = require('./global');
const { getGit, getRemoteUrls } = require('./cmds');

/**
 * Return an object of commit groupings based on "conventional-commit-types"
 *
 * @param {object} params
 * @param {string} params.commitPath
 * @param {string} params.prPath
 * @param {string} params.remoteUrl
 * @param {object} options
 * @param {Function} options.getGit
 * @returns {{'Bug Fixes': {commits: string[], title: string}, Chores: {commits: string[],
 *     title: string}, Features: {commits: string[], title: string}}}
 */
const parseCommits = (
  { commitPath, prPath, remoteUrl } = {},
  { getGit: getAliasGit = getGit, getRemoteUrls: getAliasRemoteUrls = getRemoteUrls } = {}
) => {
  const { baseUrl, commitUrl, prUrl } = getAliasRemoteUrls({ commitPath, prPath, remoteUrl });
  const updatedCommitTypes = { types: {} };

  try {
    updatedCommitTypes.types = commitTypes.types;
  } catch (e) {
    console.error(color.RED, `Conventional commit types: ${e.message}`, color.NOCOLOR);
  }

  return getAliasGit()
    .trim()
    .split(/\n/g)
    .filter(message => /:/.test(message))
    .map(message => {
      const [hashTypeScope, ...descriptionEtAll] = message.split(/:/);
      const [description, ...partialPr] = descriptionEtAll.join(' ').trim().split(/\(#/);
      const [hash, typeScope = ''] = hashTypeScope.trim().split(/\s/);
      const [type, scope = ''] = typeScope.split('(');
      return {
        hash,
        typeScope,
        type,
        scope: scope.split(')')[0],
        description: description,
        prNumber: (partialPr.join('(#').trim() || '').replace(/\D/g, '')
      };
    })
    .filter(obj => obj.type in updatedCommitTypes.types)
    .map(obj => ({ ...obj, typeLabel: obj.type }))
    .reduce((groups, { typeLabel, scope, description, prNumber, hash }) => {
      const updatedGroups = groups;

      if (!updatedGroups[typeLabel]) {
        updatedGroups[typeLabel] = {
          ...updatedCommitTypes.types[typeLabel],
          commits: []
        };
      }

      if (baseUrl) {
        const updatedPr = (prNumber && `([#${prNumber}](${prUrl}${prNumber}))`) || '';
        const updatedHash = `([${hash.substring(0, 6)}](${commitUrl}${hash}))`;
        updatedGroups[typeLabel].commits.push(`* **${scope}** ${description} ${updatedPr} ${updatedHash}`);
      } else {
        updatedGroups[typeLabel].commits.push(
          `* **${scope}** ${description} ${prNumber && `(#${prNumber})`} (${hash.substring(0, 6)})`
        );
      }

      return updatedGroups;
    }, {});
};

/**
 * Apply a clear weight to commit types, determine MAJOR, MINOR, PATCH
 *
 * @param {{ feat: { commits: Array }, refactor: { commits: Array }, fix: { commits: Array } }} parsedCommits
 * @returns {{bump: ('major'|'minor'|'patch'), weight: number}}
 */
const semverBump = (parsedCommits = {}) => {
  let weight = 0;

  Object.entries(parsedCommits).forEach(([key, { commits }]) => {
    switch (key) {
      case 'feat':
      case 'revert':
        weight += 10 * commits.length;
        break;
      case 'refactor':
        weight += 1 * commits.length;
        break;
      case 'build':
      case 'docs':
      case 'fix':
      case 'perf':
      case 'style':
      case 'test':
        weight += 0.1 * commits.length;
        break;
      default:
        break;
    }
  });

  return {
    bump: (weight >= 100 && 'major') || (weight >= 10 && 'minor') || 'patch',
    weight
  };
};

module.exports = {
  parseCommits,
  semverBump
};
