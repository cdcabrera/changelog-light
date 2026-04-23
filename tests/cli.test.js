const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Release', () => {
  let tempDir;
  let cleanUpDir;
  const cliPath = path.resolve(__dirname, '../bin/cli.js');
  const env = { ...process.env, NODE_ENV: 'ci' };

  beforeEach(() => {
    const { dir } = generateFixture(
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0'
      }),
      { filename: 'package.json', useTempDir: true }
    );

    tempDir = dir;

    const { clean } = createGitRepo(tempDir);

    cleanUpDir = clean;

    generateFixture('# Test Project', { dir: tempDir, filename: 'README.md', resetDir: false });
    execSync('git add .', { cwd: tempDir, env });
    execSync('git commit -m "feat: ABC-123 initial commit"', { cwd: tempDir, env });
  });

  afterEach(() => cleanUpDir());

  it('should show help', () => {
    const output = execSync(`node ${cliPath} --help`, { cwd: tempDir, env });

    expect(output.toString()).toContain('Usage: changelog [options]');
  });

  it('should run dry-run and output changelog', () => {
    const output = execSync(`node ${cliPath} -r`, { cwd: tempDir, env });

    expect(output.toString()).toContain('### Features');
    expect(output.toString()).toContain('initial commit');
  });

  it('should bump version on feat commit', () => {
    const { dir } = generateFixture('new feature', { dir: tempDir, filename: 'feature.txt', resetDir: false });

    execSync('git add feature.txt', { cwd: dir, env });
    execSync('git commit -m "feat: ABC-123 add amazing feature"', { cwd: dir, env });

    execSync(`node ${cliPath} --commit false`, { cwd: dir, env });

    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));

    expect(pkg.version).toBe('1.1.0');
  });

  it('should bump version when a breaking change is present', () => {
    generateFixture('breaking', { dir: tempDir, filename: 'break.txt', resetDir: false });
    execSync('git add break.txt', { cwd: tempDir, env });
    execSync('git commit -m "feat!: ABC-123 breaking change"', { cwd: tempDir, env });

    execSync(`node ${cliPath} --commit false`, { cwd: tempDir, env });

    const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf8'));

    expect(pkg.version).toBe('2.0.0');
  });

  it('should include non-conventional commits when --non-cc is used', () => {
    generateFixture('random', { dir: tempDir, filename: 'random.txt', resetDir: false });
    execSync('git add random.txt', { cwd: tempDir, env });
    execSync('git commit -m "just a random commit message"', { cwd: tempDir, env });

    const output = execSync(`node ${cliPath} -r --non-cc`, { cwd: tempDir, env });

    expect(output.toString()).toContain('### General');
    expect(output.toString()).toContain('just a random commit message');
  });

  it('should omit markdown links when --basic is used', () => {
    generateFixture('link', { dir: tempDir, filename: 'link.txt', resetDir: false });
    execSync('git add link.txt', { cwd: tempDir, env });
    execSync('git commit -m "fix: ABC-123 resolve issue (#123)"', { cwd: tempDir, env });

    const output = execSync(`node ${cliPath} -r --basic`, { cwd: tempDir, env });

    expect(output.toString()).toContain('resolve issue (#123)');
    expect(output.toString()).not.toMatch(/\[.*\]\(.*\)/);
  });
});

describe('Linting', () => {
  let tempDir;
  let cleanUpDir;
  const cliPath = path.resolve(__dirname, '../bin/cli.js');
  const env = { ...process.env, NODE_ENV: 'ci' };

  beforeEach(() => {
    const { dir } = generateFixture(
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0'
      }),
      { filename: 'package.json', useTempDir: true }
    );

    tempDir = dir;

    const { clean } = createGitRepo(tempDir);

    cleanUpDir = clean;

    generateFixture('# Test Project', { dir: tempDir, filename: 'README.md', resetDir: false });
    execSync('git add .', { cwd: tempDir, env });
    execSync('git commit -m "feat: ABC-123 initial commit"', { cwd: tempDir, env });
  });

  afterEach(() => cleanUpDir());

  it('should pass for valid commits', () => {
    generateFixture('valid', { dir: tempDir, filename: 'valid.txt', resetDir: false });
    execSync('git add valid.txt', { cwd: tempDir, env });
    execSync('git commit -m "fix: resolve issue"', { cwd: tempDir, env });

    const output = execSync(`node ${cliPath} --lint`, { cwd: tempDir, env });

    expect(output.toString()).toContain('Lint passed');
  });

  it('should fail for invalid commits', () => {
    generateFixture('invalid', { dir: tempDir, filename: 'invalid.txt', resetDir: false });
    execSync('git add invalid.txt', { cwd: tempDir, env });
    execSync('git commit -m "invalid commit message"', { cwd: tempDir, env });

    expect(() => execSync(`node ${cliPath} --lint`, { cwd: tempDir, env })).toThrow('invalid commit message');
  });

  it('should fail for message length exceeding limit', () => {
    const longMessage = 'feat: ' + 'a'.repeat(70);

    generateFixture('long', { dir: tempDir, filename: 'long.txt', resetDir: false });
    execSync('git add long.txt', { cwd: tempDir, env });
    execSync('git commit -m "' + longMessage + '"', { cwd: tempDir, env });

    expect(() => execSync(`node ${cliPath} --lint --lint-length 65`, { cwd: tempDir, env })).toThrow('message length');
  });

  it('should fail if issue number is required but missing', () => {
    generateFixture('noIssue', { dir: tempDir, filename: 'noIssue.txt', resetDir: false });
    execSync('git add noIssue.txt', { cwd: tempDir, env });
    execSync('git commit -m "feat: missing issue number"', { cwd: tempDir, env });

    expect(() => execSync(`node ${cliPath} --lint --lint-issue`, { cwd: tempDir, env })).toThrow('issue number');
  });

  it('should pass if issue number is present when required', () => {
    generateFixture('issue', { dir: tempDir, filename: 'issue.txt', resetDir: false });
    execSync('git add issue.txt', { cwd: tempDir, env });
    execSync('git commit -m "feat: ABC-123 valid description"', { cwd: tempDir, env });

    const output = execSync(`node ${cliPath} --lint --lint-issue`, { cwd: tempDir, env });

    expect(output.toString()).toContain('Lint passed');
  });
});
