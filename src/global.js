const { join } = require('path');
const commitTypes = require('conventional-commit-types');

/**
 * @module Global
 */

/**
 * Console output colors
 *
 * @type {{RED: string, WHITE: string, BLUE: string, NOCOLOR: string, BLACK: string, MAGENTA: string,
 *     YELLOW: string, CYAN: string, GREEN: string, GREY: string}}
 */
const color = {
  BLACK: '\x1b[30m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  GREEN: '\x1b[32m',
  GREY: '\x1b[90m',
  MAGENTA: '\x1b[35m',
  NOCOLOR: '\x1b[0m',
  RED: '\x1b[31m',
  WHITE: '\x1b[37m',
  YELLOW: '\x1b[33m'
};

/**
 * Set context path
 *
 * @type {string}
 * @private
 */
const contextPath =
  (process.env.NODE_ENV === 'test' && join('..', 'src', '__fixtures__')) ||
  (process.env.NODE_ENV === 'development' && join(__dirname, './__fixtures__')) ||
  process.cwd();

/**
 * Custom catch all commit type for use with the "isAllowNonConventionalCommits"
 *
 * @type {{general: {description: string, title: string, value: string}}}
 */
const generalCommitType = {
  general: {
    description: 'Commits without category',
    title: 'General',
    value: 'general'
  }
};

/**
 * Conventional commit types, expose "key" as "value"
 *
 * @type {{feat: {description: string, title: string, value: string}, fix: {description: string, title: string, value: string},
 *     chore: {description: string, title: string, value: string}}}
 */
const conventionalCommitType = (types => {
  const updatedTypes = {};

  try {
    Object.entries(types).forEach(([key, value]) => {
      updatedTypes[key] = {
        ...value,
        value: key
      };
    });
  } catch (e) {
    console.error(color.RED, `Conventional commit types: ${e.message}`, color.NOCOLOR);
  }

  return updatedTypes;
})(commitTypes.types);

/**
 * Global options/settings. One time _set, then freeze.
 *
 * @type {{contextPath: string, _set: *}}
 */
const OPTIONS = {
  contextPath,
  set _set(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'function') {
        this[key] = value.call(this);
        return;
      }

      this[key] = value;
    });
    delete this._set;
    Object.freeze(this);
  }
};

module.exports = { color, contextPath, conventionalCommitType, generalCommitType, OPTIONS };
