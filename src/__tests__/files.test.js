// spell-checker: disable
const { join } = require('path');
const { updateChangelog, updatePackage } = require('../files');
const { getComparisonCommitHashes, parseCommits } = require('../parse');
const { OPTIONS } = require('../global');

describe('updateChangelog', () => {
  it.each([
    {
      releaseCommit: '',
      commitLog: [
        { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
      ],
      description: 'basic',
      options: undefined
    },
    {
      releaseCommit: '',
      commitLog: [
        { commit: '1f12345b597123453031234555b6d25574ccacee feat(lorem)!: lorem dolor sit (#12)', isBreaking: true },
        { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
      ],
      description: 'with breaking changes',
      options: undefined
    },
    {
      releaseCommit: '',
      commitLog: [
        { commit: '1f12345b597123453031234555b6d25574ccacee feat(lorem)!: lorem dolor sit (#12)', isBreaking: true },
        { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
      ],
      description: 'with breaking changes and description',
      options: {
        releaseDescription: 'Lorem ipsum dolor sit!'
      }
    },
    {
      releaseCommit: '',
      commitLog: [
        { commit: 'LASTg45b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: 'FIRSTdd312345d421231231312312345dca11235 Initial-like commit' }
      ],
      description: 'with no release commit',
      options: undefined
    },
    {
      releaseCommit: 'REALFIRST2345d421231231312312345dca11235',
      commitLog: [
        { commit: 'REALFIRST2345d421231231312312345dca11235 chore(release): 0.1.0' },
        { commit: 'LASTg45b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: 'FIRSTdd312345d421231231312312345dca11235 Initial-like commit' }
      ],
      description: 'with release commit',
      options: undefined
    },
    {
      releaseCommit: 'REALFIRST2345d421231231312312345dca11235',
      commitLog: [
        { commit: 'REALFIRST2345d421231231312312345dca11235 chore(release): 0.1.0' },
        { commit: 'LASTg45b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: 'FIRSTdd312345d421231231312312345dca11235 Initial-like commit' }
      ],
      description: 'with release commit, description, and no version comparison markdown link',
      options: {
        isBasic: true,
        releaseDescription: '### ⚠ **lorem ipsum**\n- `dolor` (#1234)\n- `sit` (#5678)'
      }
    }
  ])('should create a CHANGELOG.md $description', ({ commitLog, options, releaseCommit }) => {
    const urlObj = {
      compareUrl: 'https://localhost/lorem/ipsum/comparmock/'
    };

    const commitObj = parseCommits({ getGit: () => commitLog });
    const comparisonObj = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => releaseCommit
    });

    expect(
      updateChangelog(
        { ...commitObj, packageVersion: '1.0.0' },
        { date: new Date('2022-10-01').toISOString(), ...options },
        {
          getComparisonCommitHashes: () => comparisonObj,
          getLinkUrls: () => urlObj
        }
      )
    ).toMatchSnapshot();
  });
});

describe('updatePackage', () => {
  it('should update a package.json', () => {
    expect(updatePackage('lorem ipsum', { packagePath: join(OPTIONS.contextPath, 'package.json') })).toMatchSnapshot(
      'package'
    );
  });
});
