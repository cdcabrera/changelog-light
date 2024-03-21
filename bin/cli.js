#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');
const yargs = require('yargs');
const packageJson = require('../package');
const { commitChangelog, OPTIONS } = require('../src');

/**
 * Setup yargs
 */
const {
  basic: isBasic,
  branch: releaseBranch,
  changelog: changelogFile,
  commit: isCommit,
  'commit-path': commitPath,
  'compare-path': comparePath,
  date,
  'dry-run': isDryRun,
  'lock-file': lockFile,
  'non-cc': isAllowNonConventionalCommits,
  override: overrideVersion,
  package: packageFile,
  'pr-path': prPath,
  'release-message': releaseTypeScope,
  'release-desc': releaseDescription,
  'link-url': linkUrl
} = yargs
  .usage('Generate a CHANGELOG.md with conventional commit types.\n\nUsage: changelog [options]')
  .help('help')
  .alias('h', 'help')
  .version('version', packageJson.version)
  .alias('v', 'version')
  .option('b', {
    alias: 'basic',
    default: false,
    describe: 'Keep updates to [CHANGELOG.md] basic, skip all markdown link syntax',
    type: 'boolean'
  })
  .option('c', {
    alias: 'commit',
    default: true,
    describe: 'Commit [CHANGELOG.md] and package.json with a release commit',
    type: 'boolean'
  })
  .option('d', {
    alias: 'date',
    default: new Date().toISOString(),
    describe: '[CHANGELOG.md] release date in the form of a valid date string. Uses system new Date([your date])',
    type: 'string'
  })
  .option('n', {
    alias: 'non-cc',
    default: false,
    describe:
      'Allow non-conventional commits to apply a semver weight and appear in [CHANGELOG.md] under a general type description.',
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
    describe: 'Generate [CHANGELOG.md] sample output',
    type: 'boolean'
  })
  .option('branch', {
    default: 'HEAD',
    describe: 'The local branch used to run `$ git log [branch]` against, defaults to HEAD, or just `$ git log`',
    type: 'string',
    requiresArg: true
  })
  .option('changelog', {
    default: './CHANGELOG.md',
    describe: 'Changelog output filename and relative path',
    type: 'string'
  })
  .option('commit-path', {
    default: 'commit/',
    describe:
      '[CHANGELOG.md] path used for commits. This will be "joined" with "link-url". Defaults to the commits path for GitHub.',
    type: 'string'
  })
  .option('compare-path', {
    default: 'compare/',
    describe:
      '[CHANGELOG.md] path used for version comparison. This will be "joined" with "link-url". Defaults to the comparison path for GitHub.',
    type: 'string'
  })
  .option('link-url', {
    describe:
      'Url override for updating all [CHANGELOG.md] base urls. This should start with "http". Attempts to use "$ git remote get-url origin", if it starts with "http"',
    type: 'string'
  })
  .option('lock-file', {
    describe:
      'Lock file read and relative path. Will attempt to determine "package-lock.json" or "yarn.lock" use and updates during release. Use if a "lock-like" file outside of "package" and "yarn" lock is customized or used.',
    type: 'string'
  })
  .option('package', {
    default: './package.json',
    describe: 'package.json read, output and relative path',
    type: 'string'
  })
  .option('pr-path', {
    default: 'pull/',
    describe:
      '[CHANGELOG.md] path used for PRs/MRs. This will be "joined" with "link-url". Defaults to the PR path for GitHub.',
    type: 'string'
  })
  .option('release-message', {
    default: 'chore(release)',
    describe:
      'A list of prefix release scope commit messages. First list item is the new commit message prefix, the second list item searches for the prior release message prefix for range. [write new, search old]',
    type: 'array'
  })
  .option('release-desc', {
    describe: 'Add a description under the release version header copy. Example, "\u26A0 BREAKING CHANGES"',
    type: 'string'
  }).argv;

/**
 * Set global OPTIONS
 *
 * @type {{comparePath: string, date: string, packagePath: Function, isOverrideVersion: boolean,
 *     packageFile: string, releaseDescription: string, isAllowNonConventionalCommits: boolean,
 *     releaseBranch: string, prPath: string, isCommit: boolean, overrideVersion: string|*,
 *     changelogPath: Function, commitPath: string, changelogFile: string,
 *     releaseTypeScope: string[]|string, isDryRun: boolean, linkUrl: string,
 *     isBasic: boolean}}
 * @private
 */
OPTIONS._set = {
  changelogFile,
  changelogPath: function () {
    return join(this.contextPath, changelogFile);
  },
  commitPath,
  comparePath,
  date,
  isAllowNonConventionalCommits,
  isBasic,
  isDryRun,
  isCommit,
  isOverrideVersion: overrideVersion !== undefined,
  linkUrl,
  lockFile,
  lockFilePath: function () {
    if (lockFile) {
      return join(this.contextPath, lockFile);
    }

    const foundLockFile = [join(this.contextPath, 'package-lock.json'), join(this.contextPath, 'yarn.lock')].find(
      fileAndPath => existsSync(fileAndPath)
    );

    if (foundLockFile) {
      return foundLockFile;
    }

    return undefined;
  },
  overrideVersion,
  packageFile,
  packagePath: function () {
    return join(this.contextPath, packageFile);
  },
  prPath,
  releaseBranch,
  releaseDescription,
  releaseTypeScope
};

/**
 * If testing stop here, otherwise continue.
 */
if (process.env.NODE_ENV === 'test') {
  process.stdout.write(JSON.stringify(OPTIONS));
} else {
  commitChangelog();
}
