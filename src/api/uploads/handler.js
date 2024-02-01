const config = require('../../utils/config.js')

class UploadsHandler {
  constructor (storageService, albumsService, validator) {
    this._storageService = storageService
    this._albumsService = albumsService
    this._validator = validator

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this)
  }

  async postUploadImageHandler (request, h) {
    const { id } = request.params
    const { cover } = request.payload
    this._validator.validateImageHeaders(cover.hapi.headers)

    const filename = await this._storageService.writeFile(cover, cover.hapi)
    const coverUrl = `http://${config.app.host}:${config.app.port}/albums/${id}/cover/images/${filename}`

    await this._albumsService.editAlbumCoverById(coverUrl, id)

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah'
    })
    response.code(201)
    return response
  }
}

module.exports = UploadsHandler
