const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const songs = require('./api/songs')
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')
const SongsValidator = require('./validator/songs')
const ClientError = require('./exceptions/ClientError')
const SongsService = require('./services/postgres/SongsService')

require('dotenv').config()

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  })

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator
    }
  })

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })
        newResponse.code(response.statusCode)
        return newResponse
      }

      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc
      if (!response.isServer) {
        return h.continue
      }

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })
      newResponse.code(500)
      return newResponse
    }

    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
