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

