// Define the interfaces for the database models.

export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  image_mime: string | null;
  image_buffer: string | null;
}

export interface Song {
  id: number;
  path: string;
  image_mime: string | null;
  image_buffer: string | null;
  title: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  year: string | null;
  lyrics: string | null;
  listens: number;
  duration: number | null;
  date_added: string;
}

export interface Playlist_Song {
  id: number;
  playlist_id: number;
  song_id: number;
}
