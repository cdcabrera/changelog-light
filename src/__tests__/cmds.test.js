const cmds = require('../cmds');

describe('Commands', () => {
  it('should attempt to run commands', () => {
    expect(
      Object.entries(cmds).map(([key, func]) => ({
        [key]: func()
      }))
    ).toMatchSnapshot('commands');
  });
});
