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

router.get("/", (req, res) => {
  return res.redirect("/items/listing");
});

router.route("/listing").get(async (req, res) => {
  // item listing page - paginated
  const page1 = parseInt(req.query.page1) || 1;
  const page2 = parseInt(req.query.page2) || 1;
  let limit = 10;
  const startIndex1 = (page1 - 1) * limit;
  const endIndex1 = page1 * limit;
  const startIndex2 = (page2 - 1) * limit;
  const endIndex2 = page2 * limit;
  let sortItem2 = "createdAt";
  let sortItem1 = "createdAt";
  let data1 = await itemsDL.fetchingLostData(sortItem1);
  let data2 = await itemsDL.fetchingFoundData(sortItem2);
  // let sort1 = req.query.option1.forEach((radio) => {
  //   if (radio.checked) {
  //     if (radio.value == "createdAt") {
  //       sortItem1 = "createdAt";
  //     }
  //     if (radio.value == "dateLostOrFound") {
  //       sortItem1 = "dateLostOrFound";
  //     }
  //   }
  // });

  // let sortBy2 = req.query.option2.forEach((radio) => {
  //   if (radio.checked) {
  //     if (radio.value == "createdAt") {
  //       sortItem2 = "createdAt";
  //     }
  //     if (radio.value == "dateLostOrFound") {
  //       sortItem2 = "dateLostOrFound";
  //     }
  //   }
  // });

  if (endIndex1 < data1.length) {
    next1 = {
      page1: page1 + 1,
    };
  }
  if (endIndex2 < data2.length) {
    next2 = {
      page2: page2 + 1,
    };
  }
  if (startIndex1 > 0) {
    previous1 = {
      page1: page1 - 1,
    };
  }
  if (startIndex2 > 0) {
    previous2 = {
      page1: page1 + 1,
    };
  }

  data1 = data1.slice(startIndex1, endIndex1);
  data2 = data2.slice(startIndex2, endIndex2);
  // try {
  //   if (!data1 && !data2) {
  //     return new Error("Data not found");
  //   }
  // } catch (e) {
  //   console.log(e);
  //   return res.status(500).send(new Error(e.message));
  // }

  return res.render("listing/listing", { data1: data1, data2: data2 });
});

router.route("/my-listings/:id").get(async (req, res) => {
  // TODO (AMAN): Pagination

  let id = req.params.id;
  try {
    id = checkId(req.params.id, "Item ID");
  } catch (e) {
    console.log(e);
    return res.status(400).render("error", {
      class: "error",
      message: "Error: Invalid ID or ID Not Provided",
    });
  }

  try {
    const d = await itemsDL.getItemsByUserId(id);

    res.render("/listing/myListings", {
      itemsData: d,
      title: "My Listings",
    });
  } catch (e) {
    return res.status(404).render("error", {
      class: "error",
      message: e,
    });
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
        actor: someone.something,
        actorId: someone.something,
        actorNumber: someone.something,
        action: someone.something,
      },
      res
    );

    const toActor = sendListingUpdateEmailToActor(
      {
        user: theUser.firstName,
        userId: theUser.email,
        userItem: theItem.name,
        // TODO (AMAN): Pass Actor Details Using Session
        actor: someone.something,
        actorId: someone.something,
        actorNumber: someone.something,
        action: someone.something,
      },
      res
    );
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
    let id = req.params.id;
    try {
      id = checkId(id, "Item ID");
    } catch (e) {
      return res.status(400).send(e);
    }
    try {
      let item = await itemsDL.getItemById(id);
    } catch (e) {
      return res.status(404).send("item not found");
    }

    id = checkId(req.params.id, "Item ID");

    const theUser = await userDL.getUserByItemId(id);
    const userId = theUser._id;

    const deletedItem = await itemsDL.deleteItem(id);
    if (!deletedItem) throw "Could Not Delete Item";
    // res.status(200).json(deletedItem);

    // Render The My Listings Page After Deletion
    const d = await itemsDL.getItemsByUserId(userId);

    res.render("/listing/userListings", {
      itemsData: d,
      title: "My Listings",
    });
    // TODO: Check with Professor If This Is a Good
    try {
      let item = await itemsDL.deleteItem(id);
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
