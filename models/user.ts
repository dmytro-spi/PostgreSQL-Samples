import pgClient from "../pgClient";

class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public updatedAt: Date,
    public createdAt: Date,
  ) {}

  public static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `;
    await pgClient.query(query);
  }

  public static async createUserPhotoCountsView() {
    const query = `
      CREATE MATERIALIZED VIEW IF NOT EXISTS sum_user_photos_in_all_albums AS
        SELECT users.id, users.name, users.email, count(photos.id) AS sum_photos
        FROM users
          LEFT JOIN photo_albums ON users.id = photo_albums.user_id
            LEFT JOIN photos ON photo_albums.id = photos.album_id
        GROUP BY users.id
    `;
    await pgClient.query(query);
    // refresh view
    await pgClient.query("REFRESH MATERIALIZED VIEW sum_user_photos_in_all_albums");
  }

  public static async getPhotoCounts(): Promise<{ user_id: number, name: string, email: string, sum_photos: number }[]> {
    const query = `
      SELECT *
      FROM sum_user_photos_in_all_albums
    `;
    const result = await pgClient.query(query);
    return result.rows;
  }

  public static async create(name: string, email: string): Promise<User> {
    const query = `
      INSERT INTO users (name, email, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `;
    const values = [name, email];
    const result = await pgClient.query(query, values);
    const user = result.rows[0];

    return new User(user.id, user.name, user.email, user.updated_at, user.created_at);
  }

  public static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT *
      FROM users
      WHERE id = $1
    `;
    const values = [id];
    const result = await pgClient.query(query, values);
    const user = result.rows[0];
    if (!user) {
      return null;
    }

    return new User(user.id, user.name, user.email, user.updated_at, user.created_at);
  }

  public static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    const values = [email];
    const result = await pgClient.query(query, values);
    const user = result.rows[0];
    if (!user) {
      return null;
    }

    return new User(user.id, user.name, user.email, user.updated_at, user.created_at);
  }

  public static async findAll(): Promise<User[]> {
    const query = `
      SELECT *
      FROM users
    `;
    const result = await pgClient.query(query);
    const users = result.rows;
    return users.map((user) => new User(user.id, user.name, user.email, user.updated_at, user.created_at));
  }

  public static async update(id: number, name: string, email: string): Promise<User | null> {
    const query = `
      UPDATE users
      SET name = $2, email = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, name, email];
    const result = await pgClient.query(query, values);
    const user = result.rows[0];
    if (!user) {
      return null;
    }

    return new User(user.id, user.name, user.email, user.updated_at, user.created_at);
  }

  public static async delete(id: number): Promise<void> {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING *
    `;
    const values = [id];
    await pgClient.query(query, values);
  }
}

export default User;
