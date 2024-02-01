// utils/config.js
require('dotenv').config()
const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  jwt: {
    at_key: process.env.ACCESS_TOKEN_KEY,
    rt_key: process.env.REFRESH_TOKEN_KEY,
    at_age: process.env.ACCESS_TOKEN_AGE
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER
  },
  redis: {
    host: process.env.REDIS_SERVER
  }
}

module.exports = config
