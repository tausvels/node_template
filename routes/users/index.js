const Controller = require('./controller');
const Service = require('./service');
const Repository = require('./repository');

module.exports = db => {
  const repository = Repository(db);
  const service = Service(repository);
  return Controller(service);
}