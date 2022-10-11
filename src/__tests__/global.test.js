const global = require('../global');

describe('Global', () => {
  it('should return specific properties', () => {
    expect(global).toMatchSnapshot('specific properties');
  });
});
