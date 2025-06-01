const { join } = require('path');
const commitTypes = require('conventional-commit-types');

/**
 * @module Global
 */

/**
 * ANSI color codes for console output formatting.
 *
 * This object provides a set of color constants that can be used to format
 * console output text. Each property is an ANSI escape sequence string.
 *
 * @type {object} Color constants
 * @property {string} BLACK - Black text color code
 * @property {string} BLUE - Blue text color code
 * @property {string} CYAN - Cyan text color code
 * @property {string} GREEN - Green text color code
 * @property {string} GREY - Grey text color code
 * @property {string} MAGENTA - Magenta text color code
 * @property {string} NOCOLOR - Reset color code (returns to default)
 * @property {string} RED - Red text color code
 * @property {string} WHITE - White text color code
 * @property {string} YELLOW - Yellow text color code
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
 * Base directory path for file operations.
 *
 * This constant determines the working directory for file operations based on the
 * current environment. It uses different paths for test, development, and production
 * environments.
 *
 * @type {string} Path to the working directory
 * @private
 */
const contextPath =
  (process.env.NODE_ENV === 'test' && join('..', 'src', '__fixtures__')) ||
  (process.env.NODE_ENV === 'development' && join(__dirname, './__fixtures__')) ||
  process.cwd();

/**
 * Fallback commit type for non-conventional commits.
 *
 * This object defines a generic commit type that can be used to categorize commits
 * that don't follow the conventional commit format. It's used when the
 * "isAllowNonConventionalCommits" option is enabled.
 *
 * @type {object} General commit type definition
 * @property {object} general - General commit type
 * @property {string} general.description - Description of the general commit type
 * @property {string} general.title - Display title for the general commit type
 * @property {string} general.value - Value used for identifying general commits
 */
const generalCommitType = {
  general: {
    description: 'Commits without category',
    title: 'General',
    value: 'general'
  }
};

/**
 * Standard conventional commit types with enhanced structure.
 *
 * This object transforms the conventional commit types from the 'conventional-commit-types'
 * package by adding the key as a 'value' property to each type object. This makes it
 * easier to reference the type key when processing commits.
 *
 * @type {object} Conventional commit types
 * @property {object} feat - Feature commit type
 * @property {string} feat.description - Description of feature commits
 * @property {string} feat.title - Display title for feature commits
 * @property {string} feat.value - Value used for identifying feature commits (equals "feat")
 * @property {object} fix - Bug fix commit type
 * @property {string} fix.description - Description of bug fix commits
 * @property {string} fix.title - Display title for bug fix commits
 * @property {string} fix.value - Value used for identifying bug fix commits (equals "fix")
 * @property {object} chore - Chore commit type
 * @property {string} chore.description - Description of chore commits
 * @property {string} chore.title - Display title for chore commits
 * @property {string} chore.value - Value used for identifying chore commits (equals "chore")
 * @property {object} [other] - Other conventional commit types as defined in 'conventional-commit-types'
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
 * Global configuration options for the changelog generator.
 *
 * This object stores all configuration options used throughout the application.
 * It has a special '_set' property that allows for one-time initialization of
 * options, after which the object is frozen to prevent further modifications.
 *
 * @type {object} Global options
 * @property {string} contextPath - Base directory path for file operations
 * @property {Function} _set - Setter function for initializing options (used once then removed)
 * @property {string} [changelogFile] - Path to the changelog file (set during initialization)
 * @property {string} [packagePath] - Path to the package.json file (set during initialization)
 * @property {boolean} [isDryRun] - Whether to perform a dry run without writing files (set during initialization)
 * @property {boolean} [isCommit] - Whether to commit changes to git (set during initialization)
 * @property {string} [overrideVersion] - Optional version to use instead of calculated version (set during initialization)
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
