const util = require('util');
const { exec } = require('child_process');
const promiseExec = util.promisify(exec);

describe('General code checks', () => {
  const srcDir = 'src';

  it('should only have specific console.[warn|log|info|error] methods', async () => {
    const { stdout } = await promiseExec(
      `echo "$(cd ./${srcDir} && git grep -n -E "(console.warn|console.log|console.info|console.error)")"`
    );

    expect(
      stdout
        .toString()
        .trim()
        .split(/[;]/g)
        .map(value => value.replace(/[\n\r]/g, ' ').trim())
        .filter(value => value.length)
    ).toMatchSnapshot('console methods');
  });
});
