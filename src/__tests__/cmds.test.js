const { join } = require('path');
const cmds = require('../cmds');
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
