const { helpers } = require("../../utils/helpers");
const { Comment } = require("./comment.model");
const { ObjectId } = require("mongodb");

class Item {
  constructor(obj) {
    // id will be automatically added by mongoDB
    this.type = helpers.sanitizeString(obj?.type);
    this.name = helpers.sanitizeString(obj?.name);
    this.description = helpers.sanitizeString(obj?.description);
    this.picture = helpers.sanitizeString(obj?.picture);
    this.dateLostOrFound = new Date(obj?.dateLostOrFound).valueOf();
    this.lostOrFoundLocation = helpers.sanitizeString(obj?.lostOrFoundLocation);

    // initialize other attributes
    this.comments = [];
    this.isClaimed = false;
    this.claimedBy = "";
    this.claimedAt = null;
    this.createdAt = new Date().valueOf();
    this.createdBy = obj?.createdBy
      ? ObjectId(helpers.sanitizeString(obj?.createdBy))
      : "";
    this.updatedAt = new Date().valueOf();
    this.updatedBy = obj?.createdBy
      ? ObjectId(helpers.sanitizeString(obj?.createdBy))
      : "";
  }

  deserialize(item) {
    return {
      ...item,
      _id: item?._id?.toString(),
      createdBy: item?.createdBy?.toString(),
      updatedBy: item?.updatedBy?.toString(),
      comments: (item.comments || []).map((ct) =>
        new Comment().deserialize(ct)
      ),
    };
  }
}

module.exports = { Item };
