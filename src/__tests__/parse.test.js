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
    const commitLog = `
      LAST1f12345b597123453031234555bvvvccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
      FIRST12345dd312345d42123123131231ca11235 Initial-like commit
    `;

    const comparisonObjNoReleaseCommit = getComparisonCommitHashes({
      getGit: () => commitLog,
      getReleaseCommit: () => ''
    });
    expect(comparisonObjNoReleaseCommit).toMatchSnapshot('first and last, no release commit');

    const comparisonObjReleaseCommit = getComparisonCommitHashes({
      getGit: () => `${commitLog}\nREALFIRST123452345d42123123131231ca11235 chore(release): 0.1.0`,
      getReleaseCommit: () => 'REALFIRST123452345d42123123131231ca11235'
    });
    expect(comparisonObjReleaseCommit).toMatchSnapshot('first and last, release commit');
  });

  it('should parse a commit message', () => {
    const commitMessageRefactor = '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)';
    const commitMessageFeature = '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements';
    const commitMessageNoScope = '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon';
    const commitMessageNonCC = '1f12s45b597123453031234555b6d25574ccacee Initial commit';

    expect({
      refactor: parseCommitMessage(commitMessageRefactor),
      feat: parseCommitMessage(commitMessageFeature),
      general: parseCommitMessage(commitMessageNonCC),
      fix: parseCommitMessage(commitMessageNoScope)
    }).toMatchSnapshot('parseCommitMessages');
  });

  it('should parse a non-conforming commit message', () => {
    const commitMessageNoScopeNoSemicolon = '1f1x345b597123453031234555b6d25574ccacee refactor lorem updates (#8)';
    const commitMessageNoTypeWithScope = '1f72345b597123453031234555b6d25574ccacee (dolor): issues/20 sit enhancements';
    const commitMessageMisplacedScope = '1f12p45b597123453031234555b6dl2401ccacee missing fix: semicolon';

    expect({
      noScopeNoSemicolon: parseCommitMessage(commitMessageNoScopeNoSemicolon),
      noTypeWithScope: parseCommitMessage(commitMessageNoTypeWithScope),
      misplacedScope: parseCommitMessage(commitMessageMisplacedScope)
    }).toMatchSnapshot('parseNonConformingCommitMessages');
  });

  it('should format a changelog commit message', () => {
    const commitMessageRefactor = '1f1x345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)';
    const commitMessageFeature = '1f72345b597123453031234555b6d25574ccacee feat(dolor): issues/20 sit enhancements';
    const commitMessageNoScope = '1f12p45b597123453031234555b6dl2401ccacee fix: missing semicolon';
    const commitMessageNonCC = '1f12s45b597123453031234555b6d25574ccacee Initial commit';

    expect({
      refactor: formatChangelogMessage(
        parseCommitMessage(commitMessageRefactor),
        {},
        {
          getRemoteUrls: () => ({
            commitUrl: 'https://localhost/lorem/ipsum/commitsmock/',
            prUrl: 'https://localhost/lorem/ipsum/prmock/'
          })
        }
      ),
      feat: formatChangelogMessage(parseCommitMessage(commitMessageFeature)),
      general: formatChangelogMessage(parseCommitMessage(commitMessageNonCC)),
      fix: formatChangelogMessage(parseCommitMessage(commitMessageNoScope))
    }).toMatchSnapshot('formatChangelogMessages');
  });

  it('should parse a commit listing using conventional commit types and semver', () => {
    const commitLog = `
      1f12345b597123453031234555b6d25574ccacee refactor(file): lorem updates (#8)
      53a12345479ef91123456e921234548ac4123450 feat(dolor): issues/20 sit enhancements (#8)
      611234511234543c39c1234536dc01234521549c fix(build): npm packages (#18)
      1f1x345b597123453031234555b6dl2401ccacee fix: missing semicolon
      fe7d312345xe604d8328d025612345925123457b build(deps): bump codecov/codecov-action from 1.1.0 to 1.1.1 (#19)
      d1234537b5e94a6512345xeb96503312345x18d2 fix(build): eslint, jsdoc updates (#16)
      e5c456ea12345vv4610fa4aff7812345ss31b1e2 chore(build): npm packages (#15)
      6f0f55d32412345221234512345d2345c3212345 chore(build): npm packages (#15)
      112345ca212345c8d2d123450c31234588f12345 build(deps): bump actions/cache from 1 to 2 (#12)
      512345d6712345a1234581234501234516b12345 build(deps): bump actions/checkout from 1 to 2 (#11)
      12345d71e12345d2fc712345dd411234586b850a build(deps): aggregated checks, updates (#10)
      1412345dd312345d4212345d53e12345dca12345 build(deps): bump actions/github-script from 5 to 6 (#9)
      12345dd312345d421231231312312345dca11235 Initial commit
    `;

    // Basic
    const commitObj = parseCommits({ getGit: () => commitLog });

    // Url path
    const { mockClear: urlPathObjClear } = mockObjectProperty(OPTIONS, {
      commitPath: 'sit',
      prPath: 'dolor',
      remoteUrl: 'https://localhost/lorem/ipsum'
    });
    const urlPathObj = parseCommits({ getGit: () => commitLog });
    urlPathObjClear();

    // No markdown links
    const { mockClear: basicCommitsNoMarkdownLinksObjClear } = mockObjectProperty(OPTIONS, {
      commitPath: 'sit',
      isBasic: true,
      prPath: 'dolor',
      remoteUrl: 'https://localhost/lorem/ipsum'
    });
    const basicCommitsNoMarkdownLinksObj = parseCommits({ getGit: () => commitLog });
    basicCommitsNoMarkdownLinksObjClear();

    // Allow general commit messages
    const { mockClear: generalCommitsObjClear } = mockObjectProperty(OPTIONS, {
      isAllowNonConventionalCommits: true,
      remoteUrl: 'https://localhost/lorem/ipsum'
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
    expect({ default: semverBump(), commits: semverBump(commitObj) }).toMatchSnapshot('semver bump');
  });
});
