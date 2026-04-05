const Task = require("../models/task");
const GlobalDAO = require("./globalDAO");

/**
 * Data Access Object (DAO) for tasks.
 */
class TaskDAO extends GlobalDAO {
  constructor() {
    super(Task);
  }

  /**
   * Creates a task tied to an authenticated user.
   * @param {string} userId
   * @param {object} data
   */
  async createForUser(userId, data) {
    return this.create({ ...data, user: userId });
  }

  /**
   * Gets all tasks for a user.
   * @param {string} userId
   */
  async getAllByUser(userId) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Gets one task by id only if it belongs to the user.
   * @param {string} taskId
   * @param {string} userId
   */
  async getByIdForUser(taskId, userId) {
    return this.model.findOne({ _id: taskId, user: userId });
  }

  /**
   * Updates one task by id only if it belongs to the user.
   * @param {string} taskId
   * @param {string} userId
   * @param {object} updateData
   */
  async updateByIdForUser(taskId, userId, updateData) {
    return this.model.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true },
    );
  }

  /**
   * Physically deletes one task by id only if it belongs to the user.
   * @param {string} taskId
   * @param {string} userId
   */
  async deleteByIdForUser(taskId, userId) {
    return this.model.findOneAndDelete({ _id: taskId, user: userId });
  }
}

module.exports = new TaskDAO();
