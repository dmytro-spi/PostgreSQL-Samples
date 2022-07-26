import pgClient from "../pgClient";

class Photo {
  constructor(
    public id: number,
    public title: string,
    public url: string,
    public albumId: number,
  ) {}

  public static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        album_id INTEGER NOT NULL,
        FOREIGN KEY (album_id) REFERENCES photo_albums (id) ON DELETE CASCADE
      )
    `;
    await pgClient.query(query);
  }

  public static async create(title: string, url: string, albumId: number): Promise<Photo> {
    const query = `
      INSERT INTO photos (title, url, album_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [title, url, albumId];
    const result = await pgClient.query(query, values);
    const photo = result.rows[0];

    return new Photo(photo.id, photo.title, photo.url, photo.album_id);
  }

  public static async findById(id: number): Promise<Photo | null> {
    const query = `
      SELECT *
      FROM photos
      WHERE id = $1
    `;
    const values = [id];
    const result = await pgClient.query(query, values);
    const photo = result.rows[0];
    if (!photo) {
      return null;
    }

    return new Photo(photo.id, photo.title, photo.url, photo.album_id);
  }

  public static async findByAlbumId(albumId: number): Promise<Photo[]> {
    const query = `
      SELECT *
      FROM photos
      WHERE album_id = $1
    `;
    const values = [albumId];
    const result = await pgClient.query(query, values);
    const photos = result.rows;

    return photos.map(photo => new Photo(photo.id, photo.title, photo.url, photo.album_id));
  }

  public static async findByUserId(userId: number): Promise<Photo[]> {
    const query = `
      SELECT *
      FROM photos
      WHERE album_id IN (
        SELECT id
        FROM photo_albums
        WHERE user_id = $1
      )
    `;
    const values = [userId];
    const result = await pgClient.query(query, values);
    const photos = result.rows;

    return photos.map(photo => new Photo(photo.id, photo.title, photo.url, photo.album_id));
  }

  public static async findAll(): Promise<Photo[]> {
    const query = `
      SELECT *
      FROM photos
    `;
    const result = await pgClient.query(query);
    const photos = result.rows;

    return photos.map(photo => new Photo(photo.id, photo.title, photo.url, photo.album_id));
  }

  public static async delete(id: number): Promise<void> {
    const query = `
      DELETE FROM photos
      WHERE id = $1
    `;
    const values = [id];
    await pgClient.query(query, values);
  }

  public static async update(id: number, title: string, url: string): Promise<Photo | null> {
    const query = `
      UPDATE photos
      SET title = $2, url = $3
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, title, url];
    const result = await pgClient.query(query, values);
    const photo = result.rows[0];
    if (!photo) {
      return null;
    }

    return new Photo(photo.id, photo.title, photo.url, photo.album_id);
  }

  public static async changeAlbum(id: number, albumId: number): Promise<Photo | null> {
    const query = `
      UPDATE photos
      SET album_id = $2
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, albumId];
    const result = await pgClient.query(query, values);
    const photo = result.rows[0];
    if (!photo) {
      return null;
    }

    return new Photo(photo.id, photo.title, photo.url, photo.album_id);
  }
}

export default Photo;
