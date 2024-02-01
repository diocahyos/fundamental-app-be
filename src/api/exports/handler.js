const autoBind = require('auto-bind')

class ExportsHandler {
  constructor (producerService, playlistService, validator) {
    this._producerService = producerService
    this._playlistService = playlistService
    this._validator = validator

    autoBind(this)
  }

  async postExportPlaylistsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { playlistId } = request.params

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
    this._validator.validateExportPlaylistsPayload(request.payload)
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail
    }

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
