import pgClient from "../pgClient";

class PhotoAlbum {
  constructor(
    public id: number,
    public title: string,
    public userId: number,
  ) {}

  public static async createTable() {
    const query = `
      CREATE TABLE photo_albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;
    await pgClient.query(query);
  }

  public static async createPhotoCountView() {
    const query = `
      CREATE MATERIALIZED VIEW IF NOT EXISTS photo_albums_view AS
        SELECT a.title AS album_name, count(p.id) AS photo_count
        FROM photo_albums a
          LEFT JOIN photos p ON p.album_id = a.id
        GROUP BY a.title
        ORDER BY photo_count DESC
    `;
    await pgClient.query(query);
    // refresh the view
    await pgClient.query("REFRESH MATERIALIZED VIEW photo_albums_view");
  }

  public static async getPhotoCounts(): Promise<{ album_name: string, photo_count: number }[]> {
    const query = `
      SELECT *
      FROM photo_albums_view
    `;
    const result = await pgClient.query(query);
    return result.rows;
  }

  public static async create(title: string, userId: number): Promise<PhotoAlbum> {
    const query = `
      INSERT INTO photo_albums (title, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [title, userId];
    const result = await pgClient.query(query, values);
    const photoAlbum = result.rows[0];

    return new PhotoAlbum(photoAlbum.id, photoAlbum.title, photoAlbum.user_id);
  }

  public static async findById(id: number): Promise<PhotoAlbum | null> {
    const query = `
      SELECT *
      FROM photo_albums
      WHERE id = $1
    `;
    const values = [id];
    const result = await pgClient.query(query, values);
    const photoAlbum = result.rows[0];
    if (!photoAlbum) {
      return null;
    }

    return new PhotoAlbum(photoAlbum.id, photoAlbum.title, photoAlbum.user_id);
  }

  public static async findByUserId(userId: number): Promise<PhotoAlbum[]> {
    const query = `
      SELECT *
      FROM photo_albums
      WHERE user_id = $1
    `;
    const values = [userId];
    const result = await pgClient.query(query, values);
    const photoAlbums = result.rows;

    return photoAlbums.map(photoAlbum => new PhotoAlbum(photoAlbum.id, photoAlbum.title, photoAlbum.user_id));
  }

  public static async delete(id: number): Promise<void> {
    const query = `
      DELETE FROM photo_albums
      WHERE id = $1
    `;
    const values = [id];
    await pgClient.query(query, values);
  }
}

export default PhotoAlbum;
