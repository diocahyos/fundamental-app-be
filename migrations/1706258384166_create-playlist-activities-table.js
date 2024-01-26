/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('playlist_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)'
    },
    username: {
      type: 'TEXT',
      notNull: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    time: {
      type: 'TEXT',
      notNull: true
    }
  })

  pgm.addConstraint('playlist_activities', 'fk_playlist_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON UPDATE CASCADE ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropConstraint('playlist_activities', 'fk_playlist_activities.playlist_id_playlists.id')
  pgm.dropTable('playlist_activities')
}
