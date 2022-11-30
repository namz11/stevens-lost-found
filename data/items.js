const { ObjectId } = require("mongodb");
const { helpers, validations, checkId } = require("../utils/helpers");
const { Item } = require("./models/item.model");
const { itemsCollection } = require("../config/mongoCollections");
const { User } = require("./models/user.model");
const { usersCollection } = require("../config/mongoCollections");
const userFunctions = require("./users");

const getItemById = async (id) => {
  id = checkId(id, "Item ID");

  if (!ObjectId.isValid(id)) throw "Invalid Object ID";

  const itemDB = await itemsCollection();

  const theItem = await itemDB.findOne({ _id: ObjectId(id) });

  if (theItem === null) throw "No Item Found With The Provided Id";

  return { ...theItem, _id: theItem._id.toString() };
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
};

const updateItem = async (id, itemObj) => {
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

  const itemDB = await itemsCollection();
  const updateInfo = await itemDB.updateOne(
    { _id: ObjectId(id) },
    { $set: itemObj }
  );
  if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
    throw "Update failed";

  return await getItemById(id);
};

module.exports = {
  getItemById,
  createItem,
  updateItem,
};
