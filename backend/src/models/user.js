const pool = require('../config/database');

class User {
  // Create a new user
  static async create(name, email) {
    const query = `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [name, email]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get or create user (helper for testing)
  static async getOrCreate(name, email) {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create(name, email);
    }
    return user;
  }
}

module.exports = User;