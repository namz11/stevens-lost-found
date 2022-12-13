const { ObjectId } = require("mongodb");
const { helpers, validations, checkId } = require("../utils/helpers");
const { Item } = require("./models/item.model");
const { itemsCollection } = require("../config/mongoCollections");
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
  const theUser = await userFunctions.getUserById(userId);
  if (!theUser) {
    throw new Error("User with the given Id does not exist");
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
  if (!foundItem) throw new Error("No Items Found With That Id");
  return allItemsWithThatId;
  // return theItems;
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
  if (itemObj.updatedBy !== ObjectId(itemById.createdBy)) {
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

const updateIsClaimedStatus = async (itemId) => {
  itemId = checkId(itemId, "Item ID");
  const itemDB = await itemsCollection();
  const theItem = await itemDB.findOne({ _id: ObjectId(itemId) });
  if (!theItem) throw new Error("No Item with the provided id exists");

  let updatedItem = {
    isClaimed: true,
  };

  const updatedInfo = await itemDB.updateOne(
    { _id: ObjectId(itemId) },
    { $set: updatedItem }
  );

  if (updatedInfo.modifiedCount === 0) {
    throw new Error("Could Not Update The Item");
  }

  return await getItemById(itemId);
};

// const searchHelper = async (itemsData, searchString) => {
//   try {
//     if (!itemsData) throw new Error("No Data Provided");
//     if (!searchString) throw new Error("No Search String Provided");

//     let score1, score2, score3;
//     let count = 0;
//     const matchedEntries = [];
//     searchString = searchString.toLowerCase();
//     for (let i = 0; i < itemsData.length; i++) {
//       if (
//         itemsData[i].name.toLowerCase().includes(searchString) ||
//         itemsData[i].lostOrFoundLocation.toLowerCase().includes(searchString) ||
//         itemsData[i].description.toLowerCase().includes(searchString)
//       ) {
//         score1 = levenshtein(itemsData[i].name.toLowerCase(), searchString);
//         score2 = levenshtein(
//           itemsData[i].lostOrFoundLocation.toLowerCase(),
//           searchString
//         );
//         score3 = levenshtein(
//           itemsData[i].description.toLowerCase(),
//           searchString
//         );

//         let scores = [];
//         scores.push(score1);
//         scores.push(score2);
//         scores.push(score3);

//         scores.sort((a, b) => a - b);
//         count += 1;
//         itemsData[i].score = scores[0];
//         matchedEntries.push(itemsData[i]);
//       }
//     }
//     matchedEntries.sort((a, b) => a.score - b.score);
//     for (let i = 0; i < matchedEntries.length; i++) {
//       delete matchedEntries[i].score;
//     }
//     return matchedEntries;
//   } catch (e) {
//     console.log(e);
//   }
// };

const deleteItem = async (id) => {
  var itemId = checkId(id, "invalid item id");

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

const fetchingLostData = async (sortItem1) => {
  const itemDB = await itemsCollection();
  const itemsList = await itemDB.find().sort({ sortItem1: -1 }).toArray();
  let Data1 = [];
  let limitPerPage1 = 10;
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].isClaimed == false) {
      if (itemsList[i].type == "lost" || itemsList[i].type == "Lost") {
        Data1.push(itemsList[i]);
      }
    }
  }

  // Data1 = Data1.find()
  //   .sort({ sortItem1: -1 })
  //   .slice((currentPage1 - 1) * limitPerPage1, currentPage1 * limitPerPage1)
  //   .exec();

  return Data1;
};

const fetchingFoundData = async (sortItem2) => {
  const itemDB = await itemsCollection();
  const itemsList = await itemDB.find().sort({ sortItem2: -1 }).toArray();
  let Data2 = [];
  let limitPerPage2 = 10;
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].isClaimed == false) {
      if (itemsList[i].type == "found" || itemsList[i].type == "Found") {
        Data2.push(itemsList[i]);
      }
    }
  }

  // Data2 = Data2.find()
  //   .sort({ sortItem2: -1 })
  //   .slice((currentPage2 - 1) * limitPerPage2, currentPage2 * limitPerPage2)
  //   .exec();

  return Data2;
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
  searchHelper,
  fetchingLostData,
  fetchingFoundData,
  createComment,
};
