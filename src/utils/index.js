const ModelGetSong = ({
  id,
  title,
  performer
}) => ({
  id,
  title,
  performer
})

const ModelGetPlaylist = ({
  id,
  name,
  username
}) => ({
  id,
  name,
  username
})

const ModelGetActivitie = ({
  username,
  title,
  action,
  time
}) => ({
  username,
  title,
  action,
  time
})

module.exports = { ModelGetSong, ModelGetPlaylist, ModelGetActivitie }
