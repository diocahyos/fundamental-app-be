const autoBind = require('auto-bind')

class PlaylistsHandler {
  constructor (playlistService, songsService, validator) {
    this._playlistService = playlistService
    this._songsService = songsService
    this._validator = validator
    autoBind(this)
  }

  async postPlaylistHandler (request, h) {
    this._validator.validatePostPlaylistPayload(request.payload)
    const { id: owner } = request.auth.credentials

    const { name } = request.payload

    const playlistId = await this._playlistService.addPlaylist({ name, owner })

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    })
    response.code(201)
    return response
  }

  async getPlaylistsHandler (request, h) {
    const { id: owner } = request.auth.credentials

    const playlists = await this._playlistService.getPlaylists(owner)
    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistService.verifyPlaylistOwner(id, credentialId)
    await this._playlistService.deletePlaylistById(id)

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus'
    }
  }

  async postSongToPlaylistByIdHandler (request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistService.verifyPlaylistAccess(id, credentialId)

    const { songId } = request.payload
    await this._songsService.getSongById(songId)
    await this._playlistService.addSongToPlaylistById(songId, id, credentialId)
    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan kedalam Playlist'
    })
    response.code(201)
    return response
  }

  async getPlaylistByIdWithSongsHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistService.verifyPlaylistAccess(id, credentialId)
    const playlist = await this._playlistService.getPlaylistByIdWithSong(id)
    return {
      status: 'success',
      data: {
        playlist
      }
    }
  }

  async deleteSongFromPlaylistByIdHandler (request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistService.verifyPlaylistAccess(id, credentialId)
    const { songId } = request.payload
    await this._playlistService.deleteSongFromPlaylistById(songId, id, credentialId)

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari Playlist'
    }
  }

  async getActivitiesByPlaylistIdHandler (request, h) {
    const { id: credentialId } = request.auth.credentials
    const { id } = request.params

    await this._playlistService.verifyPlaylistAccess(id, credentialId)
    const playlist = await this._playlistService.getActivitiesByPlaylistId(id)
    return {
      status: 'success',
      data: playlist
    }
  }
}

module.exports = PlaylistsHandler
