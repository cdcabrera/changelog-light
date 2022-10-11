const { parseCommits, semverBump } = require('../parse');

describe('Parse', () => {
  it('should parse a commit listing using conventional commit types and semver', () => {
    const commitLog = `
      1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      611234511234543c39c1234536dc01234521549c fix(build): npm packages (#18)
      fe7d312345xe604d8328d025612345925123457b build(deps): bump codecov/codecov-action from 1.1.0 to 1.1.1 (#19)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
      6f0f55d32412345221234512345d2345c3212345 chore(build): npm packages (#15)
      112345ca212345c8d2d123450c31234588f12345 build(deps): bump actions/cache from 1 to 2 (#12)
      512345d6712345a1234581234501234516b12345 build(deps): bump actions/checkout from 1 to 2 (#11)
      12345d71e12345d2fc712345dd411234586b850a build(deps): aggregated checks, updates (#10)
      1412345dd312345d4212345d53e12345dca12345 build(deps): bump actions/github-script from 5 to 6 (#9)
    `;

    const commitObj = parseCommits({ getGit: () => commitLog });

    expect({ default: parseCommits(), commits: commitObj }).toMatchSnapshot('parsed commits');
    expect({ default: semverBump(), commits: semverBump(commitObj) }).toMatchSnapshot('semver bump');
  });
});
