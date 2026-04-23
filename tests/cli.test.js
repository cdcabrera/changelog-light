const { execSync } = require('child_process');
const { commitChangelog } = require('../src');
const { OPTIONS } = require('../src/global');

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

describe('Linting', () => {
  let mockExit;
  let mockConsoleError;
  let mockConsoleInfo;
  let mockStderrWrite;

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    mockStderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleInfo.mockRestore();
    mockStderrWrite.mockRestore();
  });

  it('should exit with 1 on lint failure', () => {
    const mockParseCommits = jest.fn().mockReturnValue({
      commits: {},
      isBreakingChanges: false,
      commitsList: [
        {
          hash: '123',
          type: 'invalid',
          description: 'invalid commit',
          original: 'invalid: invalid commit',
          messageLength: 23
        }
      ]
    });

    commitChangelog({ ...OPTIONS, isLint: true }, { parseCommits: mockParseCommits });

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockConsoleError).toHaveBeenCalled();
    expect(mockStderrWrite).toHaveBeenCalled();
  });

  it('should return lint results on success in test environment', () => {
    const mockParseCommits = jest.fn().mockReturnValue({
      commits: {},
      isBreakingChanges: false,
      commitsList: [
        {
          hash: '123',
          type: 'feat',
          description: 'valid commit',
          original: 'feat: valid commit',
          messageLength: 18
        }
      ]
    });

    const result = commitChangelog({ ...OPTIONS, isLint: true }, { parseCommits: mockParseCommits });

    expect(mockExit).not.toHaveBeenCalled();
    expect(result.lintResults).toHaveLength(0);
    expect(mockConsoleInfo).toHaveBeenCalledWith(expect.anything(), '\nLint passed', expect.anything());
  });
});
