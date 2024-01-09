const ClientError = require('./ClientError')

class NotFoundError extends ClientError {
  constructor (messgae) {
    super(messgae, 404)
    this.name = 'NotFoundError'
  }
}

module.exports = NotFoundError
