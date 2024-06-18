import sqlite3 from "sqlite3";
import { Song, Playlist, Playlist_Song } from "./models";

export function initializeTables(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE if not exists playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT UNIQUE,
      description TEXT,
      image_mime TEXT,
      image_buffer TEXT
    )
  `);
  db.run(`
    CREATE TABLE if not exists songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      path TEXT, 
      image_mime TEXT, 
      image_buffer TEXT, 
      title TEXT, 
      artist TEXT, 
      album TEXT, 
      genre TEXT, 
      year TEXT, 
      lyrics TEXT, 
      listens INTEGER, 
      duration INTEGER, 
      date_added TEXT
    )
  `);
  db.run(`
    CREATE TABLE if not exists playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      playlist_id INTEGER, 
      song_id INTEGER,
      FOREIGN KEY (playlist_id) REFERENCES playlists (id),
      FOREIGN KEY (song_id) REFERENCES songs (id)
    )
  `);
  // create "All songs" playlist if it doesn't exist
  db.run(`
    INSERT OR IGNORE INTO playlists (name) VALUES ("All songs")
  `);
}

export function createSong(
  db: sqlite3.Database,
  song: Omit<Song, "id">
): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO songs (
                                path, 
                                image_mime, 
                                image_buffer, 
                                title, 
                                artist, 
                                album, 
                                genre, 
                                year, 
                                lyrics, 
                                listens, 
                                duration, 
                                date_added
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        song.path,
        song.image_mime,
        song.image_buffer,
        song.title,
        song.artist,
        song.album,
        song.genre,
        song.year,
        song.lyrics,
        song.listens,
        song.duration,
        song.date_added,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

export function getSongsByPlaylist(
  db: sqlite3.Database,
  playlistName: string
): Promise<Song[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT songs.* FROM songs 
            JOIN playlist_songs ON songs.id = playlist_songs.song_id 
            JOIN playlists ON playlists.id = playlist_songs.playlist_id 
            WHERE playlists.name = ?`,
      [playlistName],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Song[]);
        }
      }
    );
  });
}

export function addSongToPlaylist(
  db: sqlite3.Database,
  playlistName: string,
  songId: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO playlist_songs (playlist_id, song_id) 
                SELECT playlists.id, ? FROM playlists 
                WHERE playlists.name = ?`,
      [songId, playlistName],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export function getSongPathByID(
  db: sqlite3.Database,
  id: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT path FROM songs WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve((row as Song).path);
      }
    });
  });
}

export function editSong(db: sqlite3.Database, song: Song): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE songs SET 
                        path = ?, 
                        image_mime = ?, 
                        image_buffer = ?, 
                        title = ?, 
                        artist = ?, 
                        album = ?, 
                        genre = ?, 
                        year = ?, 
                        WHERE id = ?`,
      [
        song.path,
        song.image_mime,
        song.image_buffer,
        song.title,
        song.artist,
        song.album,
        song.genre,
        song.year,
        song.id,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(song.id);
        }
      }
    );
  });
}

export function getPlaylistByName(
  db: sqlite3.Database,
  name: string
): Promise<Playlist> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM playlists WHERE name = ?`, [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Playlist);
      }
    });
  });
}

export function getAllPlaylists(db: sqlite3.Database): Promise<Playlist[]> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM playlists`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Playlist[]);
      }
    });
  });
}

export function getSongsInPlaylist(
  db: sqlite3.Database,
  playlistName: string
): Promise<Song[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT songs.* FROM songs 
            JOIN playlist_songs ON songs.id = playlist_songs.song_id 
            JOIN playlists ON playlists.id = playlist_songs.playlist_id 
            WHERE playlists.name = ?`,
      [playlistName],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Song[]);
        }
      }
    );
  });
}

export function getSongByID(db: sqlite3.Database, id: number): Promise<Song> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM songs WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Song);
      }
    });
  });
}

export function createPlaylist(
  db: sqlite3.Database,
  name: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO playlists (name) VALUES (?)`, [name], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

export function getPlaylistByID(
  db: sqlite3.Database,
  id: number
): Promise<Playlist> {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM playlists WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Playlist);
      }
    });
  });
}

export function getUnusedPlaylistName(
  db: sqlite3.Database,
  counter: number = 1
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    console.log("searching for unused playlist name", counter);
    db.get(
      `SELECT * FROM playlists WHERE name = ?`,
      [`New playlist #${counter}`],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          console.log(row);
          if (row === undefined) {
            console.log("found unused playlist name", counter);
            resolve(`New playlist #${counter}`);
          } else {
            // If the name is already used, increment the counter and call the function again
            resolve(getUnusedPlaylistName(db, counter + 1));
          }
        }
      }
    );
  });
}

export function deletePlaylist(
  db: sqlite3.Database,
  id: number
): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM playlists WHERE id = ?`, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(id);
      }
    });
  });
}

export function editPlaylist(
  db: sqlite3.Database,
  playlist: Playlist
): Promise<string> {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE playlists SET name = ?, description = ?, image_mime = ?, image_buffer = ? WHERE id = ?`,
      [
        playlist.name,
        playlist.description,
        playlist.image_mime,
        playlist.image_buffer,
        playlist.id,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(playlist.name);
        }
      }
    );
  });
}

export function deleteSongFromPlaylist(
  db: sqlite3.Database,
  playlistName: string,
  songId: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM playlist_songs WHERE playlist_id = (SELECT id FROM playlists WHERE name = ?) AND song_id = ?`,
      [playlistName, songId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
