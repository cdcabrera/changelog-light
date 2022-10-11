const { updateChangelog, updatePackage } = require('../files');
const { parseCommits } = require('../parse');

describe('Files', () => {
  it('should create, and update a CHANGELOG.md', () => {
    const commitLog = `
      1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
    `;

    const commitObj = parseCommits({ getGit: () => commitLog });

    expect(updateChangelog(commitObj, undefined, { date: '2022-10-01' })).toMatchSnapshot('changelog');
  });

  it('should update a package.json', () => {
    expect(updatePackage('lorem ipsum')).toMatchSnapshot('package');
  });
});
