const Task = require("../models/task");
const GlobalDAO = require("./globalDAO");


class TaskDAO extends GlobalDAO {
  constructor() {
    super(Task);
  }

  
  async createForUser(userId, data) {
    return this.create({ ...data, user: userId });
  }

  
  async getAllByUser(userId) {
    return this.model.find({ user: userId }).populate("list", "title description").sort({ createdAt: -1 });
  }

  
  async getAllByListAndUser(listId, userId) {
    return this.model.find({ list: listId, user: userId }).populate("list", "title description").sort({ createdAt: -1 });
  }

  
  async getByIdForUser(taskId, userId) {
    return this.model.findOne({ _id: taskId, user: userId }).populate("list", "title description");
  }

  
  async updateByIdForUser(taskId, userId, updateData) {
    return this.model.findOneAndUpdate(
      { _id: taskId, user: userId },
      updateData,
      { new: true, runValidators: true },
    );
  }

  
  async deleteByIdForUser(taskId, userId) {
    return this.model.findOneAndDelete({ _id: taskId, user: userId });
  }
}

module.exports = new TaskDAO();
