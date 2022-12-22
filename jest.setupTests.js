const { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('fs');
const crypto = require('crypto');
const { extname, join, resolve } = require('path');

jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  execSync: (...args) => `<execSync>${JSON.stringify(args)}</execSync>`
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: (...args) => `<writeFileSync>${JSON.stringify(args)}</writeFileSync>`
}));

jest.mock(
  'semver/functions/clean',
  () =>
    (...args) =>
      `<semverClean>${JSON.stringify(args)}</semverClean>`
);
jest.mock(
  'semver/functions/inc',
  () =>
    (...args) =>
      `<semverInc>${JSON.stringify(args)}</semverInc>`
);

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
 * @returns {{path: string, file: string, contents: *, dir: string}}
 */
const generateFixture = (
  contents,
  { dir = resolve(__dirname, '.fixtures'), ext = 'txt', encoding = 'utf8', filename, resetDir = true } = {}
) => {
  const updatedFileName = filename || crypto.createHash('md5').update(contents).digest('hex');
  const file = extname(updatedFileName) ? updatedFileName : `${updatedFileName}.${ext}`;
  const path = join(dir, file);

  if (resetDir && existsSync(dir)) {
    rmSync(dir, { recursive: true });
  }

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, contents, { encoding });
  const updatedContents = readFileSync(path, { encoding });

  return { dir, file, path, contents: updatedContents };
};

global.generateFixture = generateFixture;

/**
 * Generate a mock for snapshot display
 *
 * @param {Array} mockFunctions
 * @returns {{}}
 */
const setMockResourceFunctions = mockFunctions => {
  const setupMock =
    mock =>
    (...args) =>
      `<${mock}>${JSON.stringify(args)}</${mock}>`;
  const mocks = {};

  mockFunctions.forEach(mock => {
    mocks[mock] = setupMock(mock);
  });

  return mocks;
};

global.setMockResourceFunctions = setMockResourceFunctions;

/**
 * Shallow mock specific properties, restore with callback, mockClear.
 * A simple object property mock for scenarios where the property is not a function/Jest fails.
 *
 * @param {object} object
 * @param {object} propertiesValues
 * @returns {{mockClear: Function}}
 */
const mockObjectProperty = (object = {}, propertiesValues) => {
  const updatedObject = object;
  const originalPropertiesValues = {};

  Object.entries(propertiesValues).forEach(([key, value]) => {
    originalPropertiesValues[key] = updatedObject[key];
    updatedObject[key] = value;
  });

  return {
    mockClear: () => {
      Object.assign(updatedObject, originalPropertiesValues);
    }
  };
};

global.mockObjectProperty = mockObjectProperty;
