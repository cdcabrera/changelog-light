const global = require('../global');
const { isUrl } = global;

describe('Global', () => {
  it('should return specific properties', () => {
    expect(global).toMatchSnapshot('specific properties');
  });

  it('should set a one-time mutable OPTIONS object', () => {
    const { OPTIONS } = global;

    OPTIONS.lorem = 'et all';
    OPTIONS.dolor = 'magna';
    OPTIONS._set = {
      lorem: 'ipsum',
      sit: function () {
        return `function test ${this.contextPath}`;
      }
    };
    OPTIONS.lorem = 'hello world';
    OPTIONS.dolor = 'sit';

    expect({ isFrozen: Object.isFrozen(OPTIONS), OPTIONS }).toMatchSnapshot('immutable');
  });
});

describe('isUrl', () => {
  it.each([
    { description: 'http', url: 'http://example.com' },
    { description: 'https', url: 'https://example.com' },
    { description: 'file', url: 'file:///path/to/file.txt' },
    { description: 'node', url: 'node://path/to/file.txt' },
    { description: 'data', url: 'data:text/plain;base64,1234567890==' }
  ])('should validate $description', ({ url }) => {
    expect(isUrl(url)).toBe(true);
  });

  it.each([
    { description: 'invalid protocol', url: 'ftp://example.com' },
    { description: 'random', url: 'random://example.com' },
    { description: 'null', url: null },
    { description: 'undefined', url: undefined }
  ])('should fail, $description', ({ url }) => {
    expect(isUrl(url)).toBe(false);
  });

  it.each([
    { description: 'http allowed, strict', options: { isStrict: true, allowedProtocols: ['http'] }, expected: false },
    { description: 'http allowed, not strict', options: { isStrict: false, allowedProtocols: ['http'] }, expected: true },
    { description: 'ftp allowed, strict', options: { isStrict: true, allowedProtocols: ['ftp'] }, expected: true },
    { description: 'ftp allowed, not strict', options: { isStrict: false, allowedProtocols: ['ftp'] }, expected: true }
  ])('should handle allowedProtocols and strict options, $description', ({ options, expected }) => {
    expect(isUrl('ftp://example.com', options)).toBe(expected);
  });
});
