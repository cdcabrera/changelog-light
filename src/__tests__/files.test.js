// spell-checker: disable
const { join } = require('path');
const { updateChangelog, updatePackage } = require('../files');
const { getComparisonCommitHashes, parseCommits } = require('../parse');
const { OPTIONS } = require('../global');

describe('Files', () => {
  const { mockClear } = mockObjectProperty(OPTIONS, {
    date: new Date('2022-10-01').toISOString(),
    changelogPath: join(OPTIONS.contextPath, 'CHANGELOG.md'),
    packagePath: join(OPTIONS.contextPath, 'package.json')
  });

  afterAll(() => {
    mockClear();
  });

  it('should create, and update a basic CHANGELOG.md', () => {
    const commitLog = [
      { commit: '1f12345b597123453031234555b6d25574ccacee feat(lorem)!: lorem dolor sit (#12)', isBreaking: true },
      { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
      { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
      { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
      { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
      { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
      { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
    ];

    const commitObj = parseCommits({ getGit: () => commitLog });
    expect(updateChangelog({ ...commitObj }, undefined)).toMatchSnapshot('changelog');
  });

  it('should create, and update CHANGELOG.md version with a comparison urls', () => {
    const commitLog = [
      { commit: 'LASTg45b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
      { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
      { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
      { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
      { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
      { commit: 'FIRSTdd312345d421231231312312345dca11235 Initial-like commit' }
    ];

    const urlObj = {
      compareUrl: 'https://localhost/lorem/ipsum/comparmock/'
    };

    const commitObj = parseCommits({ getGit: () => commitLog });
    const comparisonObjNoReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => ''
    });

    expect(
      updateChangelog({ ...commitObj, packageVersion: '1.0.0' }, undefined, {
        getComparisonCommitHashes: () => comparisonObjNoReleaseCommit,
        getLinkUrls: () => urlObj
      })
    ).toMatchSnapshot('urls and paths, no release commit');

    commitLog.push({ commit: 'REALFIRST2345d421231231312312345dca11235 chore(release): 0.1.0' });
    const comparisonObjReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => 'REALFIRST2345d421231231312312345dca11235'
    });

    expect(
      updateChangelog({ ...commitObj, packageVersion: '1.0.0' }, undefined, {
        getComparisonCommitHashes: () => comparisonObjReleaseCommit,
        getLinkUrls: () => urlObj
      })
    ).toMatchSnapshot('urls and paths, release commit');

    expect(
      updateChangelog(
        { ...commitObj, packageVersion: '1.0.0' },
        {
          ...OPTIONS,
          isBasic: true,
          releaseDescription: '### ⚠ **lorem ipsum**\n- `dolor` (#1234)\n- `sit` (#5678)'
        },
        {
          getComparisonCommitHashes: () => comparisonObjReleaseCommit,
          getLinkUrls: () => urlObj
        }
      )
    ).toMatchSnapshot('urls and paths, release commit, no markdown links');
  });

  it('should update a package.json', () => {
    expect(updatePackage('lorem ipsum')).toMatchSnapshot('package');
  });
});
