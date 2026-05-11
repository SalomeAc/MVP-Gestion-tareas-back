const List = require("../models/list");
const GlobalDAO = require("./globalDAO");


class ListDAO extends GlobalDAO {
  constructor() {
    super(List);
  }

  
  async createForUser(userId, data) {
    return this.create({ ...data, user: userId });
  }

  
  async getAllByUser(userId) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  
  async getByIdForUser(listId, userId) {
    return this.model.findOne({ _id: listId, user: userId });
  }

  
  async updateByIdForUser(listId, userId, updateData) {
    return this.model.findOneAndUpdate(
      { _id: listId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  
  async deleteByIdForUser(listId, userId) {
    return this.model.findOneAndDelete({ _id: listId, user: userId });
  }
}

module.exports = new ListDAO();
