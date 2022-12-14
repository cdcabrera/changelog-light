// spell-checker: disable
const { updateChangelog, updatePackage } = require('../files');
const { getComparisonCommitHashes, parseCommits } = require('../parse');

describe('Files', () => {
  it('should create, and update a basic CHANGELOG.md', () => {
    const commitLog = `
      1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
      12345dd312345d421231231312312345dca11235 Initial commit
    `;

    const commitObj = parseCommits({ getGit: () => commitLog });
    expect(updateChangelog(commitObj, undefined, { date: '2022-10-01' })).toMatchSnapshot('changelog');
  });

  it('should create, and update CHANGELOG.md version with a comparison urls', () => {
    const commitLog = `
      LASTg45b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
      FIRSTdd312345d421231231312312345dca11235 Initial-like commit
    `;

    const urlObj = {
      compareUrl: 'https://localhost/lorem/ipsum/comparmock/'
    };

    const commitObj = parseCommits({ getGit: () => commitLog });
    const comparisonObjNoReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => ''
    });

    expect(
      updateChangelog(
        commitObj,
        '1.0.0',
        {
          date: '2022-10-01'
        },
        {
          getComparisonCommitHashes: () => comparisonObjNoReleaseCommit,
          getRemoteUrls: () => urlObj
        }
      )
    ).toMatchSnapshot('urls and paths, no release commit');

    const comparisonObjReleaseCommit = getComparisonCommitHashes({
      getGit: () => `${commitLog}\nREALFIRST2345d421231231312312345dca11235 chore(release): 0.1.0`,
      getReleaseCommit: () => 'REALFIRST2345d421231231312312345dca11235'
    });

    expect(
      updateChangelog(
        commitObj,
        '1.0.0',
        {
          date: '2022-10-01'
        },
        {
          getComparisonCommitHashes: () => comparisonObjReleaseCommit,
          getRemoteUrls: () => urlObj
        }
      )
    ).toMatchSnapshot('urls and paths, release commit');

    expect(
      updateChangelog(
        commitObj,
        '1.0.0',
        {
          date: '2022-10-01',
          isBasic: true
        },
        {
          getComparisonCommitHashes: () => comparisonObjReleaseCommit,
          getRemoteUrls: () => urlObj
        }
      )
    ).toMatchSnapshot('urls and paths, release commit, no markdown links');
  });

  it('should update a package.json', () => {
    expect(updatePackage('lorem ipsum')).toMatchSnapshot('package');
  });
});
