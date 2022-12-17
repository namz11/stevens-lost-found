const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { checkId, helpers, validations, xssCheck } = require("../utils/helpers");
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
    let titleType = type.charAt(0).toUpperCase() + type.slice(1); //this is to Capitalize Type for title page
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
      title: `${titleType} Listing`,
      query: x,
      nextClass:
        query.size * query.page < data.count
          ? "page-link"
          : "page-link disabled",
      prevClass: query.page != 1 ? "page-link" : "page-link disabled",
    });
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.route("/my-listings/:id").get(async (req, res) => {
  // TODO (AMAN): Pagination

  let id = xssCheck(req.params.id);
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
      title: "Add Item",
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
        itemObj.name = xssCheck(itemObj?.name);
        if (!validations.isNameValid(itemObj.name)) {
          throw new Error("Name field needs to have valid value");
        }

        itemObj.type = xssCheck(itemObj?.type);
        itemObj.type = validations.isTypeValid(itemObj.type);
        if (!itemObj.type) {
          throw new Error("Type field needs to have valid value");
        }

        itemObj.dateLostOrFound = xssCheck(itemObj?.dateLostOrFound);
        if (!validations.isDateValid(itemObj.dateLostOrFound)) {
          throw new Error("Date field needs to have valid value");
        }

        itemObj.lostOrFoundLocation = xssCheck(itemObj?.lostOrFoundLocation);
        if (!validations.isLocationValid(itemObj.lostOrFoundLocation)) {
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
        title: "Edit Item",
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
        itemId = xssCheck(req.params.id);
        itemId = checkId(itemId, "Item ID");

        itemObj.name = xssCheck(itemObj?.name);
        if (!validations.isNameValid(itemOb.name)) {
          throw new Error("Name field needs to have valid value");
        }

        itemObj.dateLostOrFound = xssCheck(itemObj?.dateLostOrFound);
        if (!validations.isDateValid(itemObj.dateLostOrFound)) {
          throw new Error("Date field needs to have valid value");
        }

        itemObj.lostOrFoundLocation = xssCheck(itemObj?.lostOrFoundLocation);
        if (!validations.isLocationValid(itemObj.lostOrFoundLocation)) {
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
    id = xssCheck(id);
    id = checkId(id, "Item ID");
    authenticatedUserId = checkId(authenticatedUserId, "User ID");

    comment = xssCheck(comment);
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
  let itemId = xssCheck(req.body.itemId);
  theItem = itemsDL.getItemById(theItem);

  // get user details
  let userId = xssCheck(req.body.userId);
  theUser = userDL.getUserById(userId);

  // update isClaimed status
  itIsClaimed = itemsDL.updateIsClaimedStatus(itemId);

  if (!itIsClaimed) throw new Error("Failed to update the status");

  // Send Email
  try {
    const toUser = sendListingUpdateEmail(
      {
        user: xssCheck(theUser.firstName),
        userId: xssCheck(theUser.email),
        userItem: xssCheck(theItem.name),
        // TODO (AMAN): Pass Actor Details Using Session
        actor: xssCheck(someone.something),
        actorId: xssCheck(someone.something),
        actorNumber: xssCheck(someone.something),
        action: xssCheck(someone.something),
      },
      res
    );

    const toActor = sendListingUpdateEmailToActor(
      {
        user: xssCheck(theUser.firstName),
        userId: xssCheck(theUser.email),
        userItem: xssCheck(theItem.name),
        // TODO (AMAN): Pass Actor Details Using Session
        actor: xssCheck(someone.something),
        actorId: xssCheck(someone.something),
        actorNumber: xssCheck(someone.something),
        action: xssCheck(someone.something),
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
    let id = xssCheck(req.params.id);
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

    let titleType = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    let titleName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
    return res.render("item/view", {
      title: `${titleName} - ${titleType}`,
      item,
      user,
      allowActions,
      action: `/items/${id}/comment`,
    });
  })
  .delete(async (req, res) => {
    // delete item

    let id = xssCheck(req.params.id);
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

    id = xssCheck(req.params.id);
    id = checkId(id, "Item ID");

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
    itemId = xssCheck(req.params.id);
    itemId = checkId(itemId, "Item ID");
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message || "Something went wrong",
    });
  }

  try {
    const suggestions = await itemsDL.getItemSuggestions(itemId);
    return res.render("item/suggestions", {
      title: "Suggestions",
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
