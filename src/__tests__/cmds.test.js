const { join } = require('path');
const cmds = require('../cmds');
const { getLinkUrls } = cmds;
const { OPTIONS } = require('../global');

describe('Commands', () => {
  let mockObjectClear;

  beforeEach(() => {
    const { mockClear } = mockObjectProperty(OPTIONS, {
      date: '2022-10-01',
      changelogPath: join(OPTIONS.contextPath, 'CHANGELOG.md'),
      packagePath: join(OPTIONS.contextPath, 'package.json'),
      releaseBranch: 'HEAD'
    });

    mockObjectClear = mockClear;
  });

  afterEach(() => {
    mockObjectClear();
  });

  it('should attempt to run commands', () => {
    const { mockClear } = mockObjectProperty(OPTIONS, {
      releaseTypeScope: 'chore(release)'
    });

    expect(
      Object.entries(cmds).map(([key, func]) => ({
        [key]: func()
      }))
    ).toMatchSnapshot('commands');

    mockClear();
  });

  it('should handle multiple formats for releaseTypeScope', () => {
    // string
    const { mockClear: strMockClear } = mockObjectProperty(OPTIONS, {
      releaseTypeScope: 'chore(release)'
    });

    expect({ commitFiles: cmds.commitFiles(), getReleaseCommit: cmds.getReleaseCommit() }).toMatchSnapshot(
      'releaseTypeScope, string'
    );

    strMockClear();

    // single list item
    const { mockClear: singleItemMockClear } = mockObjectProperty(OPTIONS, {
      releaseTypeScope: ['chore(release)']
    });

    expect({ commitFiles: cmds.commitFiles(), getReleaseCommit: cmds.getReleaseCommit() }).toMatchSnapshot(
      'releaseTypeScope, single list item'
    );

    singleItemMockClear();

    // multi-list item
    const { mockClear: multiItemMockClear } = mockObjectProperty(OPTIONS, {
      releaseTypeScope: ['chore(release)', 'dolor sit', 'lorem ipsum']
    });

    expect({ commitFiles: cmds.commitFiles(), getReleaseCommit: cmds.getReleaseCommit() }).toMatchSnapshot(
      'releaseTypeScope, multi-list item'
    );

    multiItemMockClear();
  });
});

describe('getLinkUrls', () => {
  it.each([
    {
      description: 'Standard GitHub HTTPS',
      options: { linkUrl: 'https://github.com/user/repo', commitPath: 'commit', comparePath: 'compare', prPath: 'pull' },
      expected: {
        baseUrl: 'https://github.com/user/repo',
        commitUrl: 'https://github.com/user/repo/commit/',
        compareUrl: 'https://github.com/user/repo/compare/',
        prUrl: 'https://github.com/user/repo/pull/'
      }
    },
    {
      description: 'Custom GitLab Domain',
      options: {
        linkUrl: 'https://gitlab.mycorp.com/group/project',
        commitPath: '-/commit',
        prPath: '-/merge_requests'
      },
      expected: {
        baseUrl: 'https://gitlab.mycorp.com/group/project',
        commitUrl: 'https://gitlab.mycorp.com/group/project/-/commit/',
        prUrl: 'https://gitlab.mycorp.com/group/project/-/merge_requests/'
      }
    },
    {
      description: 'SSH override (Strict CLI Contract)',
      options: { linkUrl: 'git@github.com:user/repo.git', remoteDomain: 'github.com' },
      expected: {
        baseUrl: undefined,
        commitUrl: undefined,
        compareUrl: undefined,
        prUrl: undefined
      }
    }
  ])('should handle correctly, $description', ({ options, expected }) => {
    const result = getLinkUrls(options);

    expect(result).toMatchObject(expected);
  });
});
