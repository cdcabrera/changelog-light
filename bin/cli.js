#!/usr/bin/env node

const yargs = require('yargs');
const packageJson = require('../package');
const { commitChangelog, OPTIONS } = require('../src');

/**
 * Setup yargs
 */
const {
  basic: isBasic,
  commit: isCommit,
  'commit-path': commitPath,
  'compare-path': comparePath,
  date,
  'dry-run': isDryRun,
  'non-cc': isAllowNonConventionalCommits,
  override: overrideVersion,
  'pr-path': prPath,
  'remote-url': remoteUrl
} = yargs
  .usage('Generate a CHANGELOG.md with conventional commit types.\n\nUsage: changelog [options]')
  .help('help')
  .alias('h', 'help')
  .version('version', packageJson.version)
  .alias('v', 'version')
  .option('b', {
    alias: 'basic',
    default: false,
    describe: 'Keep updates to CHANGELOG.md basic, skip all markdown link syntax',
    type: 'boolean'
  })
  .option('c', {
    alias: 'commit',
    default: true,
    describe: 'Commit CHANGELOG.md and package.json with a release commit',
    type: 'boolean'
  })
  .option('d', {
    alias: 'date',
    default: new Date().toISOString(),
    describe: 'CHANGELOG.md release date in the form of a valid date string. Uses system new Date([your date])',
    type: 'string'
  })
  .option('n', {
    alias: 'non-cc',
    default: false,
    describe:
      'Allow non-conventional commits to apply a semver weight and appear in CHANGELOG.md under a general type description.',
    type: 'boolean'
  })
  .option('o', {
    alias: 'override',
    describe: 'Use a version you define.',
    type: 'string'
  })
  .option('r', {
    alias: 'dry-run',
    default: false,
    describe: 'Generate CHANGELOG.md sample output',
    type: 'boolean'
  })
  .option('commit-path', {
    default: 'commit/',
    describe:
      'CHANGELOG.md path used for commits. This will be "joined" with "remote-url". Defaults to the commits path for GitHub.',
    type: 'string'
  })
  .option('compare-path', {
    default: 'compare/',
    describe:
      'CHANGELOG.md path used for version comparison. This will be "joined" with "remote-url". Defaults to the comparison path for GitHub.',
    type: 'string'
  })
  .option('pr-path', {
    default: 'pull/',
    describe:
      'CHANGELOG.md path used for PRs/MRs. This will be "joined" with "remote-url". Defaults to the PR path for GitHub.',
    type: 'string'
  })
  .option('remote-url', {
    describe:
      'Git remote get-url for updating CHANGELOG.md base urls. This should start with "http". Defaults to "$ git remote get-url origin"',
    type: 'string'
  }).argv;

/**
 * Set global OPTIONS
 *
 * @type {{comparePath: string, date: string, commitPath: string, isOverrideVersion: boolean,
 *     isAllowNonConventionalCommits: boolean, isDryRun: boolean, remoteUrl: string,
 *     prPath: string, isCommit: boolean, overrideVersion: string|*, isBasic: boolean}}
 * @private
 */
OPTIONS._set = {
  commitPath,
  comparePath,
  date,
  isAllowNonConventionalCommits,
  isBasic,
  isDryRun,
  isCommit,
  isOverrideVersion: overrideVersion !== undefined,
  overrideVersion,
  prPath,
  remoteUrl
};

/**
 * If testing stop here, otherwise continue.
 */
if (process.env.NODE_ENV === 'test') {
  process.stdout.write(JSON.stringify(OPTIONS));
} else {
  commitChangelog();
}
