const { commitChangelog } = require('../index');
const { OPTIONS } = require('../global');

describe('Commit Changelog', () => {
  it('should parse commits to produce a CHANGELOG.md', () => {
    const { mockClear } = mockObjectProperty(OPTIONS, { date: new Date('2022-10-01').toISOString() });

    expect(commitChangelog()).toMatchSnapshot('Commit Changelog');

    mockClear();
  });

  it('should parse commits to produce a CHANGELOG.md with an override version', () => {
    const { mockClear } = mockObjectProperty(OPTIONS, {
      date: new Date('2022-10-01').toISOString(),
      isOverrideVersion: true,
      overrideVersion: '15.0.0'
    });

    expect(commitChangelog()).toMatchSnapshot('override');

    mockClear();
  });
});
