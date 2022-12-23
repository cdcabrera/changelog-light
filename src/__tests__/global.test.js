const global = require('../global');

describe('Global', () => {
  it('should return specific properties', () => {
    expect(global).toMatchSnapshot('specific properties');
  });

  it('should set a one-time mutable OPTIONS object', () => {
    const { OPTIONS } = global;
    OPTIONS.lorem = 'et all';
    OPTIONS.dolor = 'magna';
    OPTIONS._set = { lorem: 'ipsum' };
    OPTIONS.lorem = 'hello world';
    OPTIONS.dolor = 'sit';

    expect({ isFrozen: Object.isFrozen(OPTIONS), OPTIONS }).toMatchSnapshot('immutable');
  });
});
