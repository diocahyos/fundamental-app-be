const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { ModelGetSong } = require('../../utils')

class SongsService {
  constructor () {
    this._pool = new Pool()
  }

  async addSong ({ title, year, genre, performer, duration, albumId }) {
    const id = 'song-' + nanoid(16)

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs ({ title, performer }) {
    const result = await this._pool.query('SELECT * FROM songs')

    let tempResult = result.rows

    if (title !== undefined && performer !== undefined) {
      tempResult = result.rows.filter((song) => {
        return song.title.toLowerCase().includes(title.toLowerCase()) && song.performer.toLowerCase().includes(performer.toLowerCase())
      })
    } else if (title !== undefined) {
      tempResult = result.rows.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()))
    } else if (performer !== undefined) {
      tempResult = result.rows.filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()))
    }

    return tempResult.map(ModelGetSong)
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan')
    }

    result.rows[0].year = Number(result.rows[0].year)
    result.rows[0].duration = Number(result.rows[0].duration)

    return result.rows[0]
  }

  async editSongById (id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = SongsService
