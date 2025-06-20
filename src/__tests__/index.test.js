const { join } = require('path');
const { commitChangelog } = require('../index');
const { OPTIONS } = require('../global');

describe('Commit Changelog', () => {
  it('should parse commits to produce a CHANGELOG.md', () => {
    const { mockClear } = mockObjectProperty(OPTIONS, {
      date: new Date('2022-10-01').toISOString(),
      packagePath: join(OPTIONS.contextPath, 'package.json')
    });

    expect(commitChangelog()).toMatchSnapshot('Commit Changelog');
    mockClear();
  });

  it('should parse commits to produce a CHANGELOG.md with an override version', () => {
    const { mockClear } = mockObjectProperty(OPTIONS, {
      date: new Date('2022-10-01').toISOString(),
      packagePath: join(OPTIONS.contextPath, 'package.json'),
      isOverrideVersion: true,
      overrideVersion: '15.0.0'
    });

    expect(commitChangelog()).toMatchSnapshot('override');
    mockClear();
  });
});
