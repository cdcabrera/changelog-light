const { execSync } = require('child_process');

describe('CLI', () => {
  it('should use default options', () => {
    const output = execSync(`node ./bin/cli.js`);
    expect(output.toString()).toMatchSnapshot('defaults');
  });

  it('should use custom options', () => {
    const output = execSync(`node ./bin/cli.js -c false -d`);
    expect(output.toString()).toMatchSnapshot('custom');
  });
});
