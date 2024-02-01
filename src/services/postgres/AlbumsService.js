const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumsService {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
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
    const textQeury = `
			SELECT  
				albums.id AS id, 
				name, 
				albums.year AS year, 
        cover AS cover_url,
				songs.id AS song_id, 
				title, 
				performer  
			FROM albums  
			LEFT JOIN songs ON albums.id = songs.album_id  
			WHERE albums.id = $1`
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
      coverUrl: result.rows[0].cover_url === undefined ? null : result.rows[0].cover_url,
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

  async checkAlbumById (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }
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

  async editAlbumCoverById (cover, id) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id]
    }

    await this._pool.query(query)
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

  async addAlbumLike (userId, albumId) {
    const id = `ua_like-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Kamu telah menyukai Album ini')
    }

    await this._cacheService.delete(`albumlike:${albumId}`)
  }

  async deleteAlbumLikeById (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Like pada Album gagal dibatalkan')
    }

    await this._cacheService.delete(`albumlike:${albumId}`)
  }

  async getLikeAlbumById (id) {
    try {
      const result = await this._cacheService.get(`albumlike:${id}`)
      const likes = Number(result)
      const isCache = true
      return { likes, isCache }
    } catch (error) {
      const query = {
        text: `
          SELECT COUNT(albums.id) AS jumlah
          FROM albums  
          JOIN user_album_likes ON albums.id = user_album_likes.album_id  
          WHERE albums.id = $1`,
        values: [id]
      }
      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      const likes = Number(result.rows[0].jumlah)

      await this._cacheService.set(`albumlike:${id}`, likes)
      const isCache = false
      return { likes, isCache }
    }
  }

  async checkLikeAlbum (userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }
    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new InvariantError('Album ini sudah kamu sukai')
    }
  }
}

module.exports = AlbumsService
