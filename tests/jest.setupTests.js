const { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');
const os = require('os');
const { extname, join, resolve } = require('path');

/**
 * Generate a fixture from string literals.
 *
 * @param {string} contents
 * @param {object} options
 * @param {string} options.dir
 * @param {string} options.ext
 * @param {string} options.encoding
 * @param {string} options.filename
 * @param {boolean} options.resetDir
 * @param {boolean} options.useTempDir
 * @returns {{path: string, file: string, contents: *, dir: string}}
 */
const generateFixture = (
  contents,
  {
    dir,
    ext = 'txt',
    encoding = 'utf8',
    filename,
    resetDir = true,
    useTempDir = false
  } = {}
) => {
  let targetDir = dir;

  if (useTempDir) {
    targetDir = mkdtempSync(join(os.tmpdir(), 'changelog-light-test-'));
  } else if (!targetDir) {
    targetDir = resolve(__dirname, '../.fixtures');
  }

  const updatedFileName = filename || crypto.createHash('md5').update(contents).digest('hex');
  const file = extname(updatedFileName) ? updatedFileName : `${updatedFileName}.${ext}`;
  const path = join(targetDir, file);

  if (resetDir && !useTempDir && existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  writeFileSync(path, contents, { encoding });
  const updatedContents = readFileSync(path, { encoding });

  return { dir: targetDir, file, path, contents: updatedContents };
};

global.generateFixture = generateFixture;

/**
 * Create a git repository in a directory.
 *
 * @param {string} dir
 * @returns {{clean: Function}}
 */
const createGitRepo = dir => {
  const env = { ...process.env, NODE_ENV: 'ci' };

  execSync('git init', { cwd: dir, env });
  execSync('git config user.email "test@example.com"', { cwd: dir, env });
  execSync('git config user.name "Test User"', { cwd: dir, env });
  execSync('git config commit.gpgsign false', { cwd: dir, env });
  execSync('git remote add origin https://github.com/cdcabrera/changelog-light.git', { cwd: dir, env });

  return {
    clean: () => {
      if (dir && existsSync(dir)) {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch (e) {
          // ignore
        }
      }
    }
  };
};

global.createGitRepo = createGitRepo;
