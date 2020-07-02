const Controller = require('./controller');
const Repository = require('./repository');
const Service = require('./service');

module.exports = db => {
  const repository = Repository(db);
  const service = Service(repository);
  return Controller(service);
}