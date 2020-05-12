const chai = require('chai');
const diyapis = require('../');

chai.should();

describe('diyapis', () => {
  it('should make a client', (done) => {
    const client = diyapis.creatClient({ appName: 'test' });
    client.should.be.a('object');
    client.apiFetch.should.be.a('function');
    client.connect.should.be.a('function');
    client.on.should.be.a('function');
    done();
  });
});
