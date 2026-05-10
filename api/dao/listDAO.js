const List = require("../models/list");
const GlobalDAO = require("./globalDAO");

/**
 * Data Access Object (DAO) for lists.
 */
class ListDAO extends GlobalDAO {
  constructor() {
    super(List);
  }

  /**
   * Creates a list tied to an authenticated user.
   * @param {string} userId
   * @param {object} data
   */
  async createForUser(userId, data) {
    return this.create({ ...data, user: userId });
  }

  /**
   * Gets all lists for a user.
   * @param {string} userId
   */
  async getAllByUser(userId) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Gets one list by id only if it belongs to the user.
   * @param {string} listId
   * @param {string} userId
   */
  async getByIdForUser(listId, userId) {
    return this.model.findOne({ _id: listId, user: userId });
  }

  /**
   * Updates one list by id only if it belongs to the user.
   * @param {string} listId
   * @param {string} userId
   * @param {object} updateData
   */
  async updateByIdForUser(listId, userId, updateData) {
    return this.model.findOneAndUpdate(
      { _id: listId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Physically deletes one list by id only if it belongs to the user.
   * @param {string} listId
   * @param {string} userId
   */
  async deleteByIdForUser(listId, userId) {
    return this.model.findOneAndDelete({ _id: listId, user: userId });
  }
}

module.exports = new ListDAO();
