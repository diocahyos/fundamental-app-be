const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)

    return {
      status: 'success',
      data: {
        album
      }
    }
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }

  async postAlbumLikeHandler (request, h) {
    const { id: userId } = request.auth.credentials
    const { id } = request.params

    await this._service.checkAlbumById(id)
    await this._service.checkLikeAlbum(userId, id)
    await this._service.addAlbumLike(userId, id)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai'
    })
    response.code(201)
    return response
  }

  async deleteAlbumLikeByIdHandler (request, h) {
    const { id: userId } = request.auth.credentials
    const { id } = request.params
    await this._service.deleteAlbumLikeById(userId, id)

    const response = h.response({
      status: 'success',
      message: 'Like pada Album berhasil dibatalkan'
    })
    return response
  }

  async getAlbumLikeByIdHandler (request, h) {
    const { id } = request.params
    const { likes, isCache } = await this._service.getLikeAlbumById(id)

    const response = h.response({
      status: 'success',
      data: { likes }
    })

    if (isCache) {
      response.header('X-Data-Source', 'cache')
    }
    return response
  }
}

module.exports = AlbumsHandler
