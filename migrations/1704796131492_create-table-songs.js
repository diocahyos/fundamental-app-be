/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    year: {
      type: 'INT8',
      notNull: true
    },
    genre: {
      type: 'TEXT',
      notNull: true
    },
    performer: {
      type: 'TEXT',
      notNull: true
    },
    duration: { type: 'INT8' },
    album_id: {
      type: 'VARCHAR(50)'
    }
  })

  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON UPDATE CASCADE ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id')

  pgm.dropTable('songs')
}
