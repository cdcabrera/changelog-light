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

describe('Parse', () => {
  it('should return commit types', () => {
    expect(getCommitType()).toMatchSnapshot('getCommitType');
    expect(getCommitType({ isAllowNonConventionalCommits: true }).general).toMatchSnapshot('non-conventional-commits');
  });

  it('should get the first, last commits', () => {
    const commitLog = [
      { commit: 'LAST1f12345b597123453031234555bvvvccacee refactor(file): lorem updates (#8)' },
      { commit: '53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)' },
      { commit: 'd1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)' },
      { commit: 'e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)' },
      { commit: 'FIRST12345dd312345d42123123131231ca11235 Initial-like commit' }
    ];

    const comparisonObjNoReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => ''
    });
    expect(comparisonObjNoReleaseCommit).toMatchSnapshot('first and last, no release commit');

    commitLog.push({ commit: 'REALFIRST123452345d42123123131231ca11235 chore(release): 0.1.0' });
    const comparisonObjReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => 'REALFIRST123452345d42123123131231ca11235'
    });
    expect(comparisonObjReleaseCommit).toMatchSnapshot('first and last, release commit');
  });

  it('should parse a commit message', () => {
    const commitMessageBreaking = '1f1x3Ubc81234530312x434555b6d25574ccacee refactor!: dolor sit redo (#8)';
    const commitMessageRefactor = '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)';
    const commitMessageFeature = '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements';
    const commitMessageNoScope = '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon';
    const commitMessageNonCC = '1f12s45b597123453031234555b6d25574ccacee Initial commit';

    expect({
      breaking: parseCommitMessage({ message: commitMessageBreaking, isBreaking: true }),
      refactor: parseCommitMessage({ message: commitMessageRefactor }),
      feat: parseCommitMessage({ message: commitMessageFeature }),
      general: parseCommitMessage({ message: commitMessageNonCC }),
      fix: parseCommitMessage({ message: commitMessageNoScope })
    }).toMatchSnapshot('parseCommitMessages');
  });

  it('should parse a non-conforming commit message', () => {
    const commitMessageEmpty = '1f1x345b597123453031234555b6d25574ccacee';
    const commitMessageEmptyPR = '1f1x345b597123453031234555b6d25574ccacee (#9)';
    const commitMessageMadeUpType = '1f1x345b597123453031234555b6d25574ccacee ref: lorem updates (#8)';
    const commitMessageNoScopeNoSemicolon = '1f1x345b597123453031234555b6d25574ccacee refactor lorem updates (#8)';
    const commitMessageNoTypeWithScope = '1f72345b597123453031234555b6d25574ccacee (dolor): issues/20 sit enhancements';
    const commitMessageMisplacedScope = '1f12p45b597123453031234555b6dl2401ccacee missing fix: semicolon';

    expect({
      empty: parseCommitMessage({ message: commitMessageEmpty }),
      emptyPR: parseCommitMessage({ message: commitMessageEmptyPR }),
      madeUpType: parseCommitMessage({ message: commitMessageMadeUpType }),
      noScopeNoSemicolon: parseCommitMessage({ message: commitMessageNoScopeNoSemicolon }),
      noTypeWithScope: parseCommitMessage({ message: commitMessageNoTypeWithScope }),
      misplacedScope: parseCommitMessage({ message: commitMessageMisplacedScope })
    }).toMatchSnapshot('parseNonConformingCommitMessages');
  });

  it('should format a changelog commit message', () => {
    const commitMessageRefactor = '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)';
    const commitMessageFeature = '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements';
    const commitMessageNoScope = '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon';
    const commitMessageNonCC = '1f12s45b597123453031234555b6d25574ccacee Initial commit';

    expect({
      refactor: formatChangelogMessage(
        parseCommitMessage({ message: commitMessageRefactor }),
        {},
        {
          getLinkUrls: () => ({
            commitUrl: 'https://localhost/lorem/ipsum/commitsmock/',
            prUrl: 'https://localhost/lorem/ipsum/prmock/'
          })
        }
      ),
      feat: formatChangelogMessage(parseCommitMessage({ message: commitMessageFeature })),
      general: formatChangelogMessage(parseCommitMessage({ message: commitMessageNonCC })),
      fix: formatChangelogMessage(parseCommitMessage({ message: commitMessageNoScope }))
    }).toMatchSnapshot('formatChangelogMessages');
  });

  it('should format a non-conforming changelog commit message', () => {
    const commitMessageEmpty = '1f1x345b597123453031234555b6d25574ccacee';
    const commitMessageEmptyPR = '1f1x345b597123453031234555b6d25574ccacee (#9)';
    const commitMessageMadeUpType = '1f1x345b597123453031234555b6d25574ccacee ref: lorem updates (#8)';
    const commitMessageNoScopeNoSemicolon = '1f1x345b597123453031234555b6d25574ccacee refactor lorem updates (#8)';
    const commitMessageNoTypeWithScope = '1f72345b597123453031234555b6d25574ccacee (dolor): issues/20 sit enhancements';
    const commitMessageMisplacedScope = '1f12p45b597123453031234555b6dl2401ccacee missing fix: semicolon';

    expect({
      empty: formatChangelogMessage(parseCommitMessage({ message: commitMessageEmpty })),
      emptyPR: formatChangelogMessage(parseCommitMessage({ message: commitMessageEmptyPR })),
      madeUpType: formatChangelogMessage(parseCommitMessage({ message: commitMessageMadeUpType })),
      noScopeNoSemicolon: formatChangelogMessage(parseCommitMessage({ message: commitMessageNoScopeNoSemicolon })),
      noTypeWithScope: formatChangelogMessage(parseCommitMessage({ message: commitMessageNoTypeWithScope })),
      misplacedScope: formatChangelogMessage(parseCommitMessage({ message: commitMessageMisplacedScope }))
    }).toMatchSnapshot('formatChangelogMessagesNonConformingCommitMessages');
  });

  it('should parse a commit listing using conventional commit types', () => {
    const commitLog = [
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
    ];

    // Basic
    const commitObj = parseCommits({ getGit: () => commitLog });

    // Url path
    const { mockClear: urlPathObjClear } = mockObjectProperty(OPTIONS, {
      commitPath: 'sit',
      prPath: 'dolor',
      linkUrl: 'https://localhost/lorem/ipsum'
    });
    const urlPathObj = parseCommits({ getGit: () => commitLog });
    urlPathObjClear();

    // No markdown links
    const { mockClear: basicCommitsNoMarkdownLinksObjClear } = mockObjectProperty(OPTIONS, {
      commitPath: 'sit',
      isBasic: true,
      prPath: 'dolor',
      linkUrl: 'https://localhost/lorem/ipsum'
    });
    const basicCommitsNoMarkdownLinksObj = parseCommits({ getGit: () => commitLog });
    basicCommitsNoMarkdownLinksObjClear();

    // Allow general commit messages
    const { mockClear: generalCommitsObjClear } = mockObjectProperty(OPTIONS, {
      isAllowNonConventionalCommits: true,
      linkUrl: 'https://localhost/lorem/ipsum'
    });
    const generalCommitsObj = parseCommits({ getGit: () => commitLog });
    generalCommitsObjClear();

    expect({
      default: parseCommits(),
      commits: commitObj,
      urls: urlPathObj,
      basicCommitsNoMarkdownLinks: basicCommitsNoMarkdownLinksObj,
      generalCommits: generalCommitsObj
    }).toMatchSnapshot('parsed commits');
  });

  it('should return a semver version', () => {
    const commitLog = [
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
    ];

    const commitObj = parseCommits({ getGit: () => commitLog });
    expect({
      default: semverBump(),
      commits: semverBump(commitObj),
      breaking: semverBump({ ...commitObj, isBreakingChanges: true })
    }).toMatchSnapshot('semver bump');
  });
});
