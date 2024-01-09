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
      type: 'TEXT',
      reference: '"albums"',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  })
  pgm.createIndex('songs', 'album_id')
}

exports.down = pgm => {
  pgm.dropTable('songs')
}
