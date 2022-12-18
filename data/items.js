const { ObjectId } = require("mongodb");
const { helpers, validations, checkId } = require("../utils/helpers");
const { Item } = require("./models/item.model");
const {
  itemsCollection,
  usersCollection,
} = require("../config/mongoCollections");
const levenshtein = require("js-levenshtein");
const { Comment } = require("./models/comment.model");

const getItemById = async (id) => {
  id = checkId(id, "Item ID");

  const itemDB = await itemsCollection();
  const item = await itemDB.findOne({ _id: ObjectId(id) });
  if (item === null) throw new Error("No item with that id");

  return new Item().deserialize(item);
};

const getItems = async () => {
  const itemDB = await itemsCollection();
  const itemsList = await itemDB.find().toArray();
  if (!itemsList) throw new Error("Could not get all movies");
  return itemsList.map((item) => new Item().deserialize(item));
};

const createItem = async (itemObj) => {
  itemObj.createdBy = checkId(itemObj.createdBy, "User ID");

  if (!validations.isNameValid(itemObj?.name)) {
    throw new Error("Name field needs to have valid value");
  }
  itemObj.type = validations.isTypeValid(itemObj?.type);
  if (!itemObj.type) {
    throw new Error("Type field needs to have valid value");
  }
  if (!validations.isDateValid(itemObj?.dateLostOrFound)) {
    throw new Error("Date field needs to have valid value");
  }
  if (!validations.isLocationValid(itemObj?.lostOrFoundLocation)) {
    throw new Error("Location field needs to have valid value");
  }

  const newItem = new Item(itemObj);
  const itemDB = await itemsCollection();
  const insertInfo = await itemDB.insertOne(newItem);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw new Error("Could not add item");

  const added = { ...newItem, _id: insertInfo.insertedId.toString() };
  return new Item().deserialize(added);
};

const getItemsByUserId = async (userId) => {
  userId = checkId(userId, "User ID");
  const userDB = await usersCollection();
  const theUser = await userDB.findOne({ _id: ObjectId(userId) });
  if (!theUser) {
    throw new Error("User with the given Id does not exist");
  }

  const itemDB = await itemsCollection();
  const userItems = await itemDB
    .find({ createdBy: ObjectId(userId) })
    .toArray();

  if (!userItems) throw new Error("No Items Found With That Id");
  return userItems;
};

const updateItem = async (id, itemObj) => {
  id = checkId(id, "Item ID");

  if (!validations.isNameValid(itemObj?.name)) {
    throw new Error("Name field needs to have valid value");
  }
  if (!validations.isDateValid(itemObj?.dateLostOrFound)) {
    throw new Error("Date field needs to have valid value");
  }
  if (!validations.isLocationValid(itemObj?.lostOrFoundLocation)) {
    throw new Error("Location field needs to have valid value");
  }
  if (!validations.isPictureValid(itemObj?.picture)) {
    delete itemObj.picture;
  }

  const itemById = await getItemById(id);
  if (helpers.compareItemObjects(itemById, itemObj)) {
    throw new Error("Please change atleast 1 value to update");
  }

  itemObj.updatedBy = checkId(itemObj.updatedBy, "User ID");
  itemObj.updatedBy = ObjectId(itemObj.updatedBy);
  if (!itemObj.updatedBy.equals(itemById.createdBy)) {
    throw new Error("You don't have authorization to do this action");
  }
  itemObj.updatedAt = new Date().valueOf();

  const itemDB = await itemsCollection();
  const updateInfo = await itemDB.updateOne(
    { _id: ObjectId(id) },
    { $set: itemObj }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw new Error("Update failed");

  return await getItemById(id);
};

const getItemSuggestions = async (id) => {
  id = checkId(id, "Item ID");

  const itemById = await getItemById(id);
  const itemsList = await getItems();

  // get only opposite type suggestions
  let suggestions = itemsList
    .filter((it) => it.type !== itemById.type)
    .map((item) => getLevenshteinScore(itemById, item))
    .sort((x, y) => x.score - y.score)
    .slice(0, 5);

  return suggestions;
};

const getLevenshteinScore = (obj1, obj2) => {
  // check how much obj2 matches with obj1
  let { name, description, lostOrFoundLocation } = obj1;
  name = helpers.sanitizeString(name);
  description = helpers.sanitizeString(description);
  lostOrFoundLocation = helpers.sanitizeString(lostOrFoundLocation);

  let { name: name2, description: desc2, lostOrFoundLocation: loc2 } = obj2;
  name2 = helpers.sanitizeString(name2);
  desc2 = helpers.sanitizeString(desc2);
  loc2 = helpers.sanitizeString(loc2);

  let score;

  score = levenshtein(name, name2);
  score += levenshtein(name, desc2);
  score += levenshtein(lostOrFoundLocation, loc2);
  score += desc2 ? levenshtein(lostOrFoundLocation, desc2) : 0;
  if (description.length) {
    score += levenshtein(description, name2);
    score += desc2.length ? levenshtein(description, desc2) : 0;
    score += levenshtein(description, loc2);
  }

  return { ...obj2, score };
};

const updateIsClaimedStatus = async (itemId, idOfTheFinderOrClaimer) => {
  itemId = checkId(itemId, "Item ID");
  const itemDB = await itemsCollection();
  const theItem = await itemDB.findOne({ _id: ObjectId(itemId) });
  if (!theItem) throw new Error("No Item with the provided id exists");

  if (theItem.type == "lost") {
    action = "Found";
  } else if (theItem.type == "found") {
    action = "Claimed";
  }

  let updatedItem = {
    isClaimed: true,
    claimedBy: idOfTheFinderOrClaimer,
  };

  if (theItem.isClaimed === false) {
    const updatedInfo = await itemDB.updateOne(
      { _id: ObjectId(itemId) },
      { $set: updatedItem }
    );

    if (updatedInfo.modifiedCount != 1) {
      throw new Error("Could Not Update The Item");
    }

    return await getItemById(itemId);
  } else {
    return "Item Already claimed";
  }
};

const deleteItem = async (id, userId) => {
  var itemId = checkId(id, "invalid item id");

  item = await getItemById(id);
  if (!ObjectId(item.createdBy).equals(userId)) {
    throw new Error("You don't have authorization to do this action");
  }

  var items = await itemsCollection();
  var deletionInfo = await items.deleteOne({ _id: ObjectId(itemId) });

  if (deletionInfo.deletedCount === 0) {
    throw new Error("error in delete");
  }

  return true;
};

const createComment = async (comment, createdBy, itemId) => {
  itemId = checkId(itemId, "Item ID");
  const item = await getItemById(itemId);

  if (!helpers.isStringValid(comment)) {
    throw new Error("Cannot have empty comment");
  }

  let newComment = new Comment(comment, createdBy);
  item.comments.push(newComment);
  const items = await itemsCollection();
  const updateInfo = await items.updateOne(
    { _id: ObjectId(itemId) },
    { $set: { comments: item.comments } }
  );

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw new Error("Update failed");

  return await getItemById(itemId);
};

const getPaginatedItems = async (query) => {
  const itemDB = await itemsCollection();

  const count = await itemDB.countDocuments({
    type: query?.type,
    isClaimed: false,
  });
  const itemsList = await itemDB
    .find({ type: query?.type, isClaimed: false })
    .sort({ [query?.sortBy]: query?.sortOrder })
    .skip(query?.page > 0 ? (query?.page - 1) * query?.size : 0)
    .limit(query?.size)
    .toArray();

  if (!itemsList) throw new Error("Could not get items");
  return {
    count,
    items: itemsList.map((item) => new Item().deserialize(item)),
  };
};

module.exports = {
  getItemById,
  getItems,
  createItem,
  updateItem,
  getItemSuggestions,
  getItemsByUserId,
  updateIsClaimedStatus,
  deleteItem,
  createComment,
  getPaginatedItems,
};
