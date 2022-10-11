#!/usr/bin/env node

const yargs = require('yargs');
const packageJson = require('../package');
const { commitChangelog } = require('../src');

/**
 * Setup yargs
 */
const {
  commit: isCommit,
  date,
  'dry-run': isDryRun
} = yargs
  .usage('Generate a CHANGELOG.md with conventional commit types.\n\nUsage: changelog [options]')
  .help('help')
  .alias('h', 'help')
  .version('version', packageJson.version)
  .alias('v', 'version')
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
  .option('r', {
    alias: 'dry-run',
    default: false,
    describe: 'Generate CHANGELOG.md sample output',
    type: 'boolean'
  }).argv;

if (process.env.NODE_ENV === 'test') {
  process.stdout.write(JSON.stringify({ date, isDryRun, isCommit }));
} else {
  commitChangelog({
    date,
    isDryRun,
    isCommit
  });
}
