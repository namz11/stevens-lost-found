const { ObjectId } = require("mongodb");
const { helpers } = require("../../utils/helpers");

class Comment {
  constructor(comment, createdBy) {
    this._id = new ObjectId();
    this.comment = helpers.sanitizeString(comment);

    this.createdAt = new Date().valueOf();
    this.createdBy = createdBy
      ? ObjectId(helpers.sanitizeString(createdBy))
      : "";
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
      _id: new ObjectId(comment?._id),
      createdBy: new ObjectId(comment?.createdBy),
    };
  }
}

module.exports = { Comment };
