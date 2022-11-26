const { ObjectId } = require("mongodb");
const { helpers } = require("../../utils/helpers");

class Comment {
  constructor(comment) {
    this._id = new ObjectId();
    this.comment = helpers.sanitizeString(comment);

    this.createdAt = new Date().valueOf();
    this.createdBy = ""; // TODO get user id from localstorage
  }

  deserialize(comment) {
    return {
      ...comment,
      _id: comment?._id?.toString(),
      createdBy: comment?.createdBy?.toString(),
    };
  }

  serialize(comment) {
    return {
      ...comment,
      createdBy: new ObjectId(comment?.createdBy),
    };
  }
}

module.exports = { Comment };
