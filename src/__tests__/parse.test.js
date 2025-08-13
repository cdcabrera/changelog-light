// spell-checker: disable
const {
  getCommitType,
  formatChangelogMessage,
  parseCommitMessage,
  parseCommits,
  semverBump,
  getComparisonCommitHashes
} = require('../parse');
const { OPTIONS } = require('../global');

describe('getCommitType', () => {
  it.each([
    {
      description: 'basic',
      params: undefined,
      commitType: undefined
    },
    {
      description: 'non-conventional commits',
      params: { isAllowNonConventionalCommits: true },
      commitType: 'general'
    }
  ])('should return commit types, $description', ({ params, commitType }) => {
    expect((commitType && getCommitType(params)[commitType]) || getCommitType(params)).toMatchSnapshot();
  });
});

describe('getComparisonCommitHashes', () => {
  it.each([
    {
      commitLog: [
        { commit: 'LAST1f12345b597123453031234555bvvvccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: 'FIRST12345dd312345d42123123131231ca11235 Initial-like commit' }
      ],
      releaseCommit: '',
      description: 'no release commit'
    },
    {
      commitLog: [
        { commit: 'LAST1f12345b597123453031234555bvvvccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: 'FIRST12345dd312345d42123123131231ca11235 Initial-like commit' },
        { commit: 'REALFIRST123452345d42123123131231ca11235 chore(release): 0.1.0' }
      ],
      releaseCommit: 'REALFIRST123452345d42123123131231ca11235',
      description: 'release commit'
    }
  ])('should get the first and last commits, $description', ({ commitLog, releaseCommit }) => {
    expect(
      getComparisonCommitHashes({
        getGit: () => commitLog,
        getReleaseCommit: () => releaseCommit
      })
    ).toMatchSnapshot();
  });
});

describe('parseCommitMessage', () => {
  it.each([
    {
      description: 'breaking',
      params: {
        message: '1f1x3Ubc81234530312x434555b6d25574ccacee refactor!: dolor sit redo (#8)',
        isBreaking: true
      }
    },
    {
      description: 'refactor',
      params: {
        message: '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)'
      }
    },
    {
      description: 'feat',
      params: {
        message: '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements'
      }
    },
    {
      description: 'no scope fix',
      params: {
        message: '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon'
      }
    },
    {
      description: 'general, or non-conventional commit',
      params: {
        message: '1f12s45b597123453031234555b6d25574ccacee Initial commit'
      }
    },
    {
      description: 'non-conforming message, empty',
      params: {
        message: '1f1x345b597123453031234555b6d25574ccacee'
      }
    },
    {
      description: 'non-conforming message, empty with PR/MR',
      params: {
        message: '1f1x345b597123453031234555b6d25574ccacee (#9)'
      }
    },
    {
      description: 'non-conforming message, made up type',
      params: {
        message: '1f1x345b597123453031234555b6d25574ccacee ref: lorem updates (#8)'
      }
    },
    {
      description: 'non-conforming message, missing colon',
      params: {
        message: '1f1x345b597123453031234555b6d25574ccacee refactor lorem updates (#8)'
      }
    },
    {
      description: 'non-conforming message, no type but with scope',
      params: {
        message: '1f72345b597123453031234555b6d25574ccacee (dolor): issues/20 sit enhancements'
      }
    },
    {
      description: 'non-conforming message, misplaced scope',
      params: {
        message: '1f12p45b597123453031234555b6dl2401ccacee missing fix: semicolon'
      }
    }
  ])('should parse a commit message, $description', ({ params }) => {
    expect(parseCommitMessage(params)).toMatchSnapshot();
  });
});

describe('formatChangelogMessage', () => {
  it.each([
    {
      description: 'refactor',
      message: '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)',
      settings: {
        getLinkUrls: () => ({
          commitUrl: 'https://localhost/lorem/ipsum/commitsmock/',
          prUrl: 'https://localhost/lorem/ipsum/prmock/'
        })
      }
    },
    {
      description: 'feat',
      message: '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements',
      settings: undefined
    },
    {
      description: 'no scope fix',
      message: '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon',
      settings: undefined
    },
    {
      description: 'general, or non-conventional commit',
      message: '1f12s45b597123453031234555b6d25574ccacee Initial commit',
      settings: undefined
    },
    {
      description: 'non-conforming message, empty',
      message: '1f1x345b597123453031234555b6d25574ccacee',
      settings: undefined
    },
    {
      description: 'non-conforming message, empty with PR/MR',
      message: '1f1x345b597123453031234555b6d25574ccacee (#9)',
      settings: undefined
    },
    {
      description: 'non-conforming message, made up type',
      message: '1f1x345b597123453031234555b6d25574ccacee ref: lorem updates (#8)',
      settings: undefined
    },
    {
      description: 'non-conforming message, missing colon',
      message: '1f1x345b597123453031234555b6d25574ccacee refactor lorem updates (#8)',
      settings: undefined
    },
    {
      description: 'non-conforming message, no type but with scope',
      message: '1f72345b597123453031234555b6d25574ccacee (dolor): issues/20 sit enhancements',
      settings: undefined
    },
    {
      description: 'non-conforming message, misplaced scope',
      message: '1f12p45b597123453031234555b6dl2401ccacee missing fix: semicolon',
      settings: undefined
    }
  ])('should format a changelog commit message, $description', ({ message, settings }) => {
    expect(formatChangelogMessage(parseCommitMessage({ message }), undefined, settings)).toMatchSnapshot();
  });
});

describe('parseCommits', () => {
  it.each([
    {
      description: 'basic',
      options: undefined
    },
    {
      description: 'url path',
      options: {
        commitPath: 'sit',
        prPath: 'dolor',
        linkUrl: 'https://localhost/lorem/ipsum'
      }
    },
    {
      description: 'no markdown links',
      options: {
        commitPath: 'sit',
        isBasic: true,
        prPath: 'dolor',
        linkUrl: 'https://localhost/lorem/ipsum'
      }
    },
    {
      description: 'allow general commit messages',
      options: {
        isAllowNonConventionalCommits: true,
        linkUrl: 'https://localhost/lorem/ipsum'
      }
    }
  ])('should parse a commit listing using conventional commit types, $description', ({ options }) => {
    const commitLog = [
      { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
      { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
      { commit: '611234511234543c39c1234536dc01234521549c fix(build): npm packages (#18)' },
      { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
      { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
      { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
      { commit: '6f0f55d32412345221234512345d2345c3212345 chore(build): npm packages (#15)' },
      { commit: '112345ca212345c8d2d123450c31234588f12345 build(deps): bump actions/cache from 1 to 2 (#12)' },
      { commit: '512345d6712345a1234581234501234516b12345 build(deps): bump actions/checkout from 1 to 2 (#11)' },
      { commit: '12345d71e12345d2fc712345dd411234586b850a build(deps): aggregated checks, updates (#10)' },
      { commit: '1412345dd312345d4212345d53e12345dca12345 build(deps): bump actions/github-script from 5 to 6 (#9)' },
      { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
    ];

    const { mockClear } = mockObjectProperty(OPTIONS, { ...options });

    expect(parseCommits({ getGit: () => commitLog })).toMatchSnapshot();
    mockClear();
  });
});

describe('semverBump', () => {
  it.each([
    {
      commitLog: undefined,
      params: undefined,
      description: 'basic'
    },
    {
      commitLog: [
        { commit: '1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)' },
        { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
        { commit: '611234511234543c39c1234536dc01234521549c fix(build): npm packages (#18)' },
        { commit: '1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon' },
        {
          commit:
            'fe7d312345xe604d8328d025612345925123457b build(deps): bump codecov/codecov-action from 1.1.0 to 1.1.1 (#19)'
        },
        { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
        { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
        { commit: '6f0f55d32412345221234512345d2345c3212345 chore(build): npm packages (#15)' },
        { commit: '112345ca212345c8d2d123450c31234588f12345 build(deps): bump actions/cache from 1 to 2 (#12)' },
        { commit: '512345d6712345a1234581234501234516b12345 build(deps): bump actions/checkout from 1 to 2 (#11)' },
        { commit: '12345d71e12345d2fc712345dd411234586b850a build(deps): aggregated checks, updates (#10)' },
        { commit: '1412345dd312345d4212345d53e12345dca12345 build(deps): bump actions/github-script from 5 to 6 (#9)' },
        { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
      ],
      params: undefined,
      description: 'commits'
    },
    {
      commitLog: [
        { commit: '6f0f55d32412345221234512345d2345c3212345 chore(build): npm packages (#15)' },
        { commit: '112345ca212345c8d2d123450c31234588f12345 build(deps): bump actions/cache from 1 to 2 (#12)' },
        { commit: '512345d6712345a1234581234501234516b12345 build(deps): bump actions/checkout from 1 to 2 (#11)' },
        { commit: '12345d71e12345d2fc712345dd411234586b850a build(deps): aggregated checks, updates (#10)' },
        { commit: '1412345dd312345d4212345d53e12345dca12345 build(deps): bump actions/github-script from 5 to 6 (#9)' },
        { commit: '12345dd312345d421231231312312345dca11235 Initial commit' }
      ],
      params: { isBreakingChanges: true },
      description: 'breaking'
    }
  ])('should return a semver version, $description', ({ commitLog, params }) => {
    const commitObj = (commitLog && parseCommits({ getGit: () => commitLog })) || undefined;

    expect(semverBump({ ...commitObj, ...params })).toMatchSnapshot();
  });
});
