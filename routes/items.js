// TODO: Deal With Sessions

const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { checkId, helpers, validations } = require("../utils/helpers");
const { itemImageUpload } = require("../utils/multer");
const {
  sendListingUpdateEmail,
  sendListingUpdateEmailToActor,
} = require("../utils/mailer");
const { itemsDL, userDL } = require("../data");
const { QueryParams } = require("../data/models/queryParams.model");

router.get("/", (req, res) => {
  return res.redirect("/items/listing/lost");
});

router.route("/listing/:type").get(async (req, res) => {
  try {
    const type = helpers.sanitizeString(req.params.type).toLowerCase();
    // item listing page - paginated
    const query = new QueryParams(
      { ...req.query, type },
      { sortBy: "dateAdded" }
    );
    let allUsers = await userDL.getAllUsers();
    let data = await itemsDL.getPaginatedItems(query);
    if (data?.item?.length) {
      data.items = (data?.items || []).map((item) => {
        for (user of allUsers) {
          if (ObjectId(user._id).equals(item.createdBy)) {
            item = { ...item, userInfo: user };
            break;
          }
        }
        return {
          ...c,
          createdAt: helpers.getDate(item.createdAt),
          dateLostOrFound: helpers.getDate(item.dateLostOrFound),
        };
      });
    }

    return res.render("listing/listing", {
      ...data,
      type,
      query,
    });
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.route("/my-listing").get(async (req, res) => {
  let authenticatedUserId = req?.session?.passport?.user?._id;
  try {
    authenticatedUserId = checkId(authenticatedUserId, "User ID");
  } catch (e) {
    return res.status(400).send(e);
  }

  try {
    const d = await itemsDL.getItemsByUserId(authenticatedUserId);

    return res.render("listing/myListings", {
      items: d,
      title: "My Listings",
    });
  } catch (e) {
    return res.status(404).send(e);
  }
});

router
  .route("/add")
  .get(async (req, res) => {
    // create item page

    return res.render("item/create", {
      action: `/items/add`,
      metaData: {
        dateLostOrFound: {
          max: helpers.getDate(new Date()),
          min: helpers.getDate(
            new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          ),
        },
      },
    });
  })
  .post(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      let itemObj;
      try {
        itemObj = req.body;
        itemObj.picture = req?.file?.path;
      } catch (e) {
        console.log(e);
        return res.status(500).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }

      try {
        itemObj.createdBy = checkId(req.headers["x-user-id"], "User ID");
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "You don't have authorization to do this action",
        });
      }

      try {
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
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }

      try {
        const newItem = await itemsDL.createItem(itemObj);
        return res.send({
          success: true,
          message: "Item created!",
          data: newItem,
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }
    }
  );

router
  .route("/edit/:id")
  .get(async (req, res) => {
    // edit item page
    let itemId;
    try {
      itemId = checkId(req.params.id, "Item ID");
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || "Something went wrong",
      });
    }

    try {
      let item = await itemsDL.getItemById(itemId);

      return res.render("item/edit", {
        action: `/items/edit/${itemId}`,
        item: {
          ...item,
          dateLostOrFound: helpers.getDate(new Date(item.dateLostOrFound)),
        },
        metaData: {
          dateLostOrFound: {
            max: helpers.getDate(new Date()),
            min: helpers.getDate(
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            ),
          },
        },
      });
    } catch (e) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }
  })
  .put(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      itemImageUpload(req, res, function (err) {
        if (err) {
          return;
        }
      });

      let itemId, itemObj, itemById;
      try {
        itemObj = req.body;
        itemObj.picture = req?.file?.path;
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }

      try {
        itemId = checkId(req.params.id, "Item ID");

        if (!validations.isNameValid(itemObj?.name)) {
          throw new Error("Name field needs to have valid value");
        }
        if (!validations.isDateValid(itemObj?.dateLostOrFound)) {
          throw new Error("Date field needs to have valid value");
        }
        if (!validations.isLocationValid(itemObj?.lostOrFoundLocation)) {
          throw new Error("Location field needs to have valid value");
        }
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }

      try {
        itemById = await itemsDL.getItemById(itemId);
      } catch (e) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      if (item.isClaimed) {
        return res.status(400).json({
          success: false,
          message: "Item has been claimed. Action unavailable.",
        });
      }

      if (helpers.compareItemObjects(itemById, itemObj)) {
        return res.status(400).json({
          success: false,
          message: "Please change atleast 1 value to update",
        });
      }

      try {
        itemObj.updatedBy = checkId(req.headers["x-user-id"], "User ID");
        if (ObjectId(itemObj.updatedBy) !== ObjectId(itemById.createdBy)) {
          throw new Error("You don't have authorization to do this action");
        }
      } catch (e) {
        return res.status(401).json({
          success: false,
          message: "You don't have authorization to do this action",
        });
      }

      try {
        const updatedItem = await itemsDL.updateItem(itemId, itemObj);
        return res.json({
          success: true,
          message: "Item updated!",
          data: updatedItem,
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }
    }
  );

router.route("/:id/comment").post(async (req, res) => {
  let id = req.params.id;
  const { comment } = req.body;
  let authenticatedUserId = req?.session?.passport?.user?._id;

  try {
    id = checkId(id, "Item ID");
    authenticatedUserId = checkId(authenticatedUserId, "User ID");
    if (!helpers.isStringValid(comment)) {
      throw new Error("Cannot have empty comment");
    }
  } catch (e) {
    return res.status(400).send(e);
  }

  try {
    let item = await itemsDL.createComment(comment, authenticatedUserId, id);
    return res.redirect("/items/" + id);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.route("/:id/status").put(async (req, res) => {
  // TODO (AMAN): Pass Actor Details Using Session

  // get item details
  theItem = itemsDL.getItemById(req.body.itemId);

  // get user details
  theUser = userDL.getUserById(req.body.userId);

  if (theItem.type == "lost") {
    action = "Found";
  } else if (theItem.type == "found") {
    action = "Claim";
  }
  // update isClaimed status
  itIsClaimed = itemsDL.updateIsClaimedStatus(itemId);

  if (!itIsClaimed) throw new Error("Failed to update the status");

  // Send Email
  try {
    const toUser = sendListingUpdateEmail(
      {
        user: theUser.firstName,
        userId: theUser.email,
        userItem: theItem.name,
        // TODO (AMAN): Pass Actor Details Using Session
        actor: req.session.passport.firstName,
        actorId: req.session.passport.email,
        actorNumber: req.session.passport.phone,
        action: action,
      },
      res
    );

    const toActor = sendListingUpdateEmailToActor(
      {
        user: theUser.firstName,
        userId: theUser.email,
        userItem: theItem.name,
        // TODO (AMAN): Pass Actor Details Using Session
        actor: req.session.passport.firstName,
        actorId: req.session.passport.email,
        actorNumber: req.session.passport.phone,
        action: action,
      },
      res
    );

    if (!toUser)
      throw "Oops! Something Went Wrong: Failed to send email to user";
    if (!toActor) throw "Oops! Something Went Wrong: Failed to send email";

    // TODO (AMAN)
    // res.redirect("");
    // res.render("");
  } catch (e) {
    console.log(e);
    // TODO (AMAN)
    // res.redirect("");
    // res.render("");
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    let id = req.params.id;
    let user, item, authenticatedUserId;
    try {
      id = checkId(id, "Item ID");
    } catch (e) {
      return res.status(400).send(e);
    }

    try {
      item = await itemsDL.getItemById(id);
      item = {
        ...item,
        dateLostOrFound: helpers.getDate(new Date(item.dateLostOrFound)),
        createdAt: helpers.getDate(new Date(item.createdAt)),
      };
    } catch (e) {
      return res.status(404).send("Item not found");
    }

    try {
      let allUsers = await userDL.getAllUsers();
      item.comments = item.comments.map((c) => {
        for (u of allUsers) {
          if (ObjectId(u._id).equals(c.createdBy)) {
            c = { ...c, userInfo: u };
            break;
          }
        }
        return { ...c, createdAt: helpers.getDate(c.createdAt) };
      });
      let userId = checkId(item.createdBy, "User ID");
      user = await userDL.getUserById(userId);
      authenticatedUserId = req?.session?.passport?.user?._id;
    } catch (e) {
      return res.status(500).send("Internal Server Error");
    }
    const allowActions =
      ObjectId(user._id).equals(authenticatedUserId) && !item.isClaimed;
    return res.render("item/view", {
      title: "Item Page",
      item,
      user,
      allowActions,
      action: `/items/${id}/comment`,
    });
  })
  .delete(async (req, res) => {
    // delete item
    let id = req.params.id,
      item;

    try {
      id = checkId(id, "Item ID");
    } catch (e) {
      return res.status(400).send(e);
    }
    try {
      item = await itemsDL.getItemById(id);
    } catch (e) {
      return res.status(404).send("item not found");
    }

    let authenticatedUserId = req?.session?.passport?.user?._id;
    try {
      authenticatedUserId = checkId(authenticatedUserId, "User ID");
    } catch (e) {
      return res.status(400).send(e);
    }
    if (item) {
      try {
        if (!ObjectId(item.createdBy).equals(authenticatedUserId)) {
          throw new Error("You don't have authorization to do this action");
        }
      } catch (e) {
        return res.status(401).json({
          success: false,
          message: "You don't have authorization to do this action",
        });
      }
    }

    try {
      await itemsDL.deleteItem(id, authenticatedUserId);
      return res.json({
        success: true,
        message: "Item deleted!",
      });
    } catch (e) {
      return res.status(500).send("Internal server errror");
    }
  });

router.route("/:id/suggestions").get(async (req, res) => {
  // TODO validations
  let itemId;
  try {
    itemId = checkId(req.params.id, "Item ID");
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message || "Something went wrong",
    });
  }

  try {
    const suggestions = await itemsDL.getItemSuggestions(itemId);
    return res.render("item/suggestions", {
      suggestions,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message || "Something went wrong",
    });
  }
});

module.exports = router;

//#region new code
// router.route("/listing").get(async (req, res) => {
//   var noMatch = null;
//   if(req.query.search){
//       const buttonId = req.query.buttonId;
//       if (buttonId === "search-form-lost-button") { //This condition will take care of dynamic content loading
//           // Handle button 1 click...
//           const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//           // Get all items from DB
//           const itemDB = await itemsCollection();
//           let d = itemDB.find({name: regex, lostOrFoundLocation: regex, description: regex}, function(err, allListings){
//               if(err){
//                   console.log(err);
//               } else {
//                   if(allListings.length < 1) {
//                       noMatch = "No listings match that query, please try again.";
//                   }
//                   res.json({ data1: allListings, noMatch: noMatch }); // Return JSON response
//               }
//           });
//       }

//        else if (buttonId === "search-form-found-button") {
//   // Handle button 2 click... //This condition will take care of dynamic content loading
//   // If this happens use .html() upon success in ajax reuest to put the data into the html element
//   const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//   // Get all items from DB
//   const itemDB = await itemsCollection();
//   let d = itemDB.find({name: regex, lostOrFoundLocation: regex, description: regex}, function(err, allListings){
//       if(err){
//           console.log(err);
//       } else {
//           if(allListings.length < 1) {
//               noMatch = "No listings match that query, please try again.";
//           }
//           res.json({ data2: allListings, noMatch: noMatch }); // Return JSON response
//       }
//   });
// }
// } else{ //This code will load the listings default

// const page1 = parseInt(req.query.page1) || 1;
// const page2 = parseInt(req.query.page2) || 1;
// let limit = 5;
// const startIndex1 = (page1 - 1) * limit;
// const endIndex1 = page1 * limit;
// const startIndex2 = (page2 - 1) * limit;
// const endIndex2 = page2 * limit;
// let sortItem2 = req.body.sortItem1 || "createdAt";
// let sortItem1 = req.body.sortItem2 || "createdAt";

// if(req.query.search){

// }

// let data1 = await itemsDL.fetchingLostData(sortItem1);
// let data2 = await itemsDL.fetchingFoundData(sortItem2);

// if (endIndex1 > data1.length) {
//   endIndex1 = data1.length - 1;
// }
// if (endIndex2 > data2.length) {
//   endIndex2 = data2.length - 1;
// }
// if (startIndex1 < 0) {
//   startIndex1 = 0;
// }
// if (startIndex2 < 0) {
//   startIndex2 = 0;
// }

// data1 = data1.slice(startIndex1, endIndex1);
// data2 = data2.slice(startIndex2, endIndex2);

// return res.render("listing/listing", {
//   data1: data1,
//   data2: data2,
//   page1: page1,
//   page2: page2,
// });
// }
// });
//#endregion

// Paginated
// router.route("/my-listings/:id").get(async (req, res) => {
//   let id = req.params.id;
//   let page = req.query.page || 1;
//   let limit = 10;
//   let skip = (page - 1) * limit;

//   try {
//     id = checkId(req.params.id, "Item ID");
//   } catch (e) {
//     console.log(e)
//     return res.status(400).render("error",{
//       class: "error",
//       message: "Error: Invalid ID or ID Not Provided",
//     });
//   }

//   try {
//     const items = await itemFunctions.getItemsByUserId(id);
//     const count = items.length;
//     const pages = Math.ceil(count / limit);
//     const d = items.slice(skip, skip + limit);

//     res.render("/listing/userListings", {
//       itemsData: d, title: "My Listings", page, pages
//     });
//   } catch (e) {
//     return res.status(404).render("error", {
//       class: "error",
//       message: e,
//     });
//   }
// });
