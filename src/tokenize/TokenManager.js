const Jwt = require('@hapi/jwt')
const InvariantError = require('../exceptions/InvariantError')
const config = require('../utils/config.js')

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, config.jwt.at_key),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, config.jwt.rt_key),

  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, config.jwt.rt_key)

      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }
}

module.exports = TokenManager
