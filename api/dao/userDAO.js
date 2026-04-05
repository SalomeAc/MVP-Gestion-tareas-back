const User = require("../models/user");
const Task = require("../models/task");
const GlobalDAO = require("./globalDAO");

/**
 * Data Access Object (DAO) for the User model.
 *
 * Extends the generic {@link GlobalDAO} class to provide
 * database operations (create, read, update, delete, getAll)
 * specifically for User documents.
 */
class UserDAO extends GlobalDAO {
  /**
   * Create a new UserDAO instance.
   *
   * Passes the User Mongoose model to the parent class so that
   * all inherited CRUD methods operate on the User collection.
   */
  constructor() {
    super(User);
  }

  /**
   * Finds an user document by email.
   *
   * @async
   * @param {string} email - The email of the user to search for.
   * @returns {Promise<Object|null>} Returns a Promise that resolves to the user document if found, or `null` if no user exists with the given email.
   */
  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  /**
   * Overrides delete method from GlobalDAO.
   * - Deletes all lists associated to the user.
   * - Deletes all tasks associated to the user.
   * - Finally, deletes the user.
   *
   * @async
   * @param {string} userId - ID of the user to be deleted.
   * @returns {Promise<Object|null>} Doc of the user just deleted, null if the doc didn't exist.
   */
  async delete(userId) {
    await Task.deleteMany({ user: userId });

    const deletedUser = await this.model.findByIdAndDelete(userId);

    return deletedUser;
  }
}

/**
 * Export a singleton instance of UserDAO.
 */
module.exports = new UserDAO();
