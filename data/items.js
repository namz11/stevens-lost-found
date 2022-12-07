const { ObjectId } = require("mongodb");
const { helpers, validations, checkId } = require("../utils/helpers");
const { Item } = require("./models/item.model");
const { itemsCollection } = require("../config/mongoCollections");
const levenshtein = require("js-levenshtein");
const { Comment } = require("./models/comment.model");

const getItemById = async (id) => {
  id = checkId(id, "Item ID");

  if (!ObjectId.isValid(id)) throw "Invalid Object ID";

  const itemDB = await itemsCollection();

  const theItem = await itemDB.findOne({ _id: ObjectId(id) });

  if (theItem === null) throw "No Item Found With The Provided Id";

  return { ...theItem, _id: theItem._id.toString() };
};

const getItems = async () => {
  const itemDB = await itemsCollection();
  const itemsList = await itemDB.find().toArray();
  if (!itemsList) throw new Error("Could not get all movies");
  return itemsList.map((item) => new Item().deserialize(item));
};

const createItem = async (itemObj) => {
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
    throw "Could not add item";

  const added = { ...newItem, _id: insertInfo.insertedId.toString() };
  return new Item().deserialize(added);
};

const getItemsByUserId = async (userId) => {
  userId = checkId(userId, "User ID");
  const theUser = await userFunctions.getUserById(userId);
  if (!theUser) {
    throw "User with the given Id does not exist";
  }
  const itemDB = await itemsCollection();

  const theItems = await itemDB.find({}).toArray();

  // const theItems = await itemDB
  //   .find({}, { projection: { createdBy: ObjectId(userId) } })
  //   .toArray();

  let foundItem = false;
  let allItemsWithThatId = {};
  for (let i = 0; i < theItems.length; i++) {
    const currentItem = theItems[i];
    if (currentItem.createdBy.toString() === userId) {
      foundItem = true;
      allItemsWithThatId = currentItem;
    }
  }
  if (!foundItem) throw "No Items Found With That Id";
  return allItemsWithThatId;
  // return theItems;
};

const updateItem = async (id, itemObj) => {
  // TODO check for valid id

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

  // TODO uncomment
  // const itemById = await getItemById(id);
  // if (helpers.compareItemObjects(itemById, itemObj)) {
  //   throw "Please change atleast 1 value to update";
  // }

  // TODO check for user

  const itemDB = await itemsCollection();
  const updateInfo = await itemDB.updateOne(
    { _id: ObjectId(id) },
    { $set: itemObj }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";

  return await getItemById(id);
};
const getItemSuggestions = async (id) => {
  // TODO check for valid id
  id = checkId(id, "Item ID");

  const itemById = await getItemById(id);
  const itemsList = await getItems();

  // get only opposite type suggestions
  let suggestions = itemsList
    .filter((it) => it.type !== itemById.type)
    .map((item) => getLevenshteinScore(itemById, item))
    .sort((x, y) => x.score - y.score)
    .slice(0, 10);

  // return itemsList;
  return suggestions;
};

const getLevenshteinScore = (obj1, obj2) => {
  // check how much obj2 matches with obj1
  const { name, description, lostOrFoundLocation } = obj1;
  let score;
  score += levenshtein(name, obj2.name);
  score += levenshtein(name, obj2.description);
  score += levenshtein(lostOrFoundLocation, obj2.lostOrFoundLocation);
  score += levenshtein(lostOrFoundLocation, obj2.description);
  score += levenshtein(description, obj2.name);
  score += levenshtein(description, obj2.description);
  score += levenshtein(description, obj2.lostOrFoundLocation);
  return { ...obj2, score };
};

const updateIsClaimedStatus = async (itemId) => {
  itemId = checkId(itemId, "Item ID");
  const itemDB = await itemsCollection();
  const theItem = await itemDB.findOne({ _id: ObjectId(itemId) });
  if (!theItem) throw "No Item with the provided id exists";

  let updatedItem = {
    isClaimed: true,
  };

  const updatedInfo = await itemDB.updateOne(
    { _id: ObjectId(itemId) },
    { $set: updatedItem }
  );

  if (updatedInfo.modifiedCount === 0) {
    throw " Could Not Update The Item";
  }

  return await getItemById(itemId);
};

const searchHelper = async (itemsData, searchString) => {
  try {
    if (!itemsData) throw "No Data Provided";
    if (!searchString) throw "No Search String Provided";

    let score1, score2, score3;
    let count = 0;
    const matchedEntries = [];
    searchString = searchString.toLowerCase();
    for (let i = 0; i < itemsData.length; i++) {
      if (
        itemsData[i].name.toLowerCase().includes(searchString) ||
        itemsData[i].lostOrFoundLocation.toLowerCase().includes(searchString) ||
        itemsData[i].description.toLowerCase().includes(searchString)
      ) {
        score1 = levenshtein(itemsData[i].name.toLowerCase(), searchString);
        score2 = levenshtein(
          itemsData[i].lostOrFoundLocation.toLowerCase(),
          searchString
        );
        score3 = levenshtein(
          itemsData[i].description.toLowerCase(),
          searchString
        );

        let scores = [];
        scores.push(score1);
        scores.push(score2);
        scores.push(score3);

        scores.sort((a, b) => a - b);
        count += 1;
        itemsData[i].score = scores[0];
        matchedEntries.push(itemsData[i]);
      }
    }
    matchedEntries.sort((a, b) => a.score - b.score);
    for (let i = 0; i < matchedEntries.length; i++) {
      delete matchedEntries[i].score;
    }
    return matchedEntries;
  } catch (e) {
    console.log(e);
  }
};

const deleteItem = async (id) => {
  var itemId = checkId(id, "invalid item id");

  var items = await itemsCollection();
  var deletionInfo = await items.deleteOne({ _id: ObjectId(itemId) });

  if (deletionInfo.deletedCount === 0) {
    throw new Error("error in delete");
  }
  return true;
};

const createComment = async (comment, id) => {
  id = checkId(id, "ID");
  const item = await getItemById(id);

  if (!helpers.isStringValid(comment)) {
    throw new Error("comment field needs to have valid value");
  }

  let obj = new Comment(comment);
  item.comments.push(obj);

  const items = await itemsCollection();
  const updateInfo = await items.updateOne(
    { _id: ObjectId(id) },
    { $set: { comments: item.comments } }
  );

  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";

  return await getItemById(id);
};

module.exports = {
  getItemById,
  getItems,
  createItem,
  updateItem,
  getItemSuggestions,
  getItemsByUserId,
  updateIsClaimedStatus,
  getLevenshteinScore,
  deleteItem,
  searchHelper,
  createComment,
};
