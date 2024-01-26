const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { ModelGetPlaylist, ModelGetSong, ModelGetActivitie } = require('../../utils')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor (collaborationService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
  }

  async addPlaylist ({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT 
          playlists.id,
          playlists.name,
          users.username
        FROM playlists
        LEFT JOIN users on playlists.owner = users.id
        WHERE owner = $1
      `,
      values: [owner]
    }

    let result = await this._pool.query(query)

    if (result.rowCount === 0) {
      const query = {
        text: `SELECT 
            playlists.id,
            playlists.name,
            users.username
          FROM playlists
          LEFT JOIN users ON playlists.owner = users.id
          LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id 
          WHERE owner = $1 OR collaborations.user_id = $1
        `,
        values: [owner]
      }

      result = await this._pool.query(query)
    }

    return result.rows.map(ModelGetPlaylist)
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async getPlaylistByIdWithSong (id) {
    const query = {
      text: `SELECT 
        playlists.id AS "playlist_id",
        playlists.name,
        users.username,
        songs.id,
        title,
        performer
      FROM playlists 
      LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      LEFT JOIN songs on playlist_songs.song_id = songs.id
      LEFT JOIN users on playlists.owner = users.id 
      WHERE playlists.id = $1
      `,
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const response = {
      id: result.rows[0].playlist_id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs: []
    }
    response.songs = result.rows.map(ModelGetSong)

    return response
  }

  async getActivitiesByPlaylistId (id) {
    const query = {
      text: `SELECT 
          playlists.id,
          username,
          title,
          action,
          time
        FROM playlists
        LEFT JOIN playlist_activities on playlists.id = playlist_activities.playlist_id
        WHERE playlists.id = $1
      `,
      values: [id]
    }

    const result = await this._pool.query(query)

    const response = {
      playlistId: result.rows[0].id,
      activities: []
    }

    response.activities = result.rows.map(ModelGetActivitie)

    return response
  }

  async addSongToPlaylistById (songId, playlistId, userId) {
    const id = `playlist_song-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan didalam Playlist')
    }

    this.addActivities(playlistId, songId, userId, 'add')
  }

  async deleteSongFromPlaylistById (songId, playlistId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2',
      values: [songId, playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus dari Playlist. Song Id tidak ditemukan')
    }

    this.addActivities(playlistId, songId, userId, 'delete')
  }

  async addActivities (playlistId, songId, userId, action) {
    const queryUsername = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [userId]
    }

    const resultUsername = await this._pool.query(queryUsername)

    const queryTitle = {
      text: 'SELECT title FROM songs WHERE id = $1',
      values: [songId]
    }

    const resultTitle = await this._pool.query(queryTitle)

    const id = `ps_activitie-${nanoid(16)}`
    const title = resultTitle.rows[0].title
    const username = resultUsername.rows[0].username
    const time = new Date()

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, username, title, action, time]
    }

    await this._pool.query(query)
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService
