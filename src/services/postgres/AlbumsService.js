const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumsService {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum ({ name, year }) {
    const id = 'album-' + nanoid(16)

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const textQeury = '' +
			'SELECT ' +
				'albums.id AS id,' +
				'name,' +
				'albums.year AS year,' +
				'songs.id AS song_id,' +
				'title,' +
				'performer ' +
			'FROM albums ' +
			'LEFT JOIN songs ON albums.id = songs.album_id ' +
			'WHERE albums.id = $1'
    const query = {
      text: textQeury,
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    result.rows[0].year = Number(result.rows[0].year)
    const response = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      year: result.rows[0].year,
      songs: []
    }

    if (result.rows[0].song_id !== null) {
      result.rows.forEach(item => {
        const song = {
          id: item.song_id,
          title: item.title,
          performer: item.performer
        }
        response.songs.push(song)
      })
    }

    return response
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
