const { helpers } = require("../../utils/helpers");
const { Comment } = require("./comment.model");

class Item {
  constructor(obj) {
    // id will be automatically added by mongoDB
    this.type = helpers.sanitizeString(obj?.type);
    this.name = helpers.sanitizeString(obj?.name);
    this.description = helpers.sanitizeString(obj?.description);
    this.picture = helpers.sanitizeString(obj?.picture); // TODO unsure for now
    this.dateLostOrFound = new Date(obj?.dateLostOrFound).valueOf();
    this.lostOrFoundLocation = helpers.sanitizeString(obj?.lostOrFoundLocation);

    // initialize other attributes
    this.comments = [];
    this.isClaimed = false;
    this.createdAt = new Date().valueOf();
    this.createdBy = ""; // TODO get user id from localstorage
    this.updatedAt = new Date().valueOf();
    this.updatedBy = ""; // TODO get user id from localstorage
  }

  deserialize(item) {
    return {
      ...item,
      _id: item?._id?.toString(),
      comments: (item.comments || []).map((ct) =>
        new Comment().deserialize(ct)
      ),
    };
  }
}

module.exports = { Item };
