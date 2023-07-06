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
 * Convenience wrapper for preset console messaging and colors.
 *
 * @type {{warn: (function(...[*]): void), log: (function(...[*]): void), success: (function(...[*]): void),
 *    error: (function(...[*]): void), info: (function(...[*]): void)}}
 */
const consoleMessage = (() => {
  const applyColor = (method, passedColor, ...args) =>
    console[method](`${passedColor}${args.join('\n')}${color.NOCOLOR}`);

  return {
    error: (...args) => applyColor('error', color.RED, ...args),
    success: (...args) => applyColor('log', color.GREEN, ...args),
    info: (...args) => applyColor('info', color.BLUE, ...args),
    log: (...args) => applyColor('log', color.NOCOLOR, ...args),
    warn: (...args) => applyColor('warn', color.YELLOW, ...args)
  };
})();

/**
 * Basic message logging.
 *
 * @type {{log: Function, _log: object, readonly messages: Array, error: Function,
 *     message: Function, readonly logs: Array, readonly errors: Array}}
 */
const logger = {
  _log: {},

  get errors() {
    return Object.values(this._log)
      .filter(({ type }) => type === 'error')
      .map(({ message }) => message)
      .join('\n');
  },

  get logs() {
    return Object.values(this._log)
      .map(({ message }) => message)
      .join('\n');
  },

  get messages() {
    return Object.values(this._log)
      .filter(({ type }) => type === 'message')
      .map(({ message }) => message)
      .join('\n');
  },

  error: function (param, { displayNow = false } = {}) {
    const updatedParam = (typeof param === 'string' && { message: param }) || param;
    this.log({ ...updatedParam, type: 'error' });

    if (displayNow) {
      consoleMessage.error(updatedParam.message);
    }
  },
  log: function ({ message, type, displayNow, ...rest }) {
    this._log[message] = { message, type: type || 'message', ...rest };

    if (displayNow) {
      consoleMessage.log(message);
    }
  },
  message: function (param, { displayNow = false } = {}) {
    const updatedParam = (typeof param === 'string' && { message: param }) || param;
    this.log({ ...updatedParam, type: 'message' });

    if (displayNow) {
      consoleMessage.info(updatedParam.message);
    }
  }
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
const conventionalCommitType = ((types, { logger: loggerAlias = logger } = {}) => {
  const updatedTypes = {};

  try {
    Object.entries(types).forEach(([key, value]) => {
      updatedTypes[key] = {
        ...value,
        value: key
      };
    });
  } catch (e) {
    loggerAlias.error(`Conventional commit types: ${e.message}`, { displayNow: true });
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

module.exports = { color, consoleMessage, contextPath, conventionalCommitType, generalCommitType, logger, OPTIONS };
