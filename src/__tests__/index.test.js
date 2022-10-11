const { commitChangelog } = require('../index');

describe('Commit Changelog', () => {
  it('should parse commits to produce a CHANGELOG.md', () => {
    expect(commitChangelog({ date: new Date('2022-10-01').toISOString() })).toMatchSnapshot('Commit Changelog');
  });
});
