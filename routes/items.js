const express = require("express");
const path = require("path");
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
  try {
    return res.redirect("/items/listing/lost");
  } catch (e) {
    return res.status(404).sendFile(path.resolve("static/404.html"));
  }
});

router.route("/listing/:type").get(async (req, res) => {
  try {
    const type = helpers.sanitizeString(req.params.type).toLowerCase();
    if (type !== "lost" && type !== "found") {
      return res.status(404).sendFile(path.resolve("static/404.html"));
    }

    // item listing page - paginated
    const query = new QueryParams(
      { ...req.query, type },
      { sortBy: "createdAt" }
    );
    let titleType = type.charAt(0).toUpperCase() + type.slice(1); //this is to Capitalize Type for title page
    let allUsers = await userDL.getAllUsers();
    let data = await itemsDL.getPaginatedItems(query);
    if (data?.items?.length) {
      data.items = (data?.items || []).map((item) => {
        for (let user of allUsers) {
          if (ObjectId(user._id).equals(item.createdBy)) {
            item = { ...item, userInfo: user };
            break;
          }
        }
        return {
          ...item,
          createdAt: helpers.formatDate(new Date(item.createdAt)),
          dateLostOrFound: helpers.formatDate(new Date(item.dateLostOrFound)),
        };
      });
    }
    const x = new QueryParams().deserialize(query);
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
    return res.status(500).send(e);
  }
});

router.route("/my-listing").get(async (req, res) => {
  let authenticatedUserId;
  try {
    authenticatedUserId = req?.session?.passport?.user?._id;
    authenticatedUserId = checkId(authenticatedUserId, "User ID");
  } catch (e) {
    return res.status(400).send(e);
  }

  try {
    let allUsers = await userDL.getAllUsers();
    let items = await itemsDL.getItemsByUserId(authenticatedUserId);
    if (items?.length) {
      items = (items || []).map((item) => {
        let foundClaimed = false,
          foundCreated = false;
        for (let user of allUsers) {
          if (foundClaimed && foundCreated) break;
          if (ObjectId(user._id).equals(item.createdBy)) {
            item = { ...item, userInfo: user };
            foundCreated = true;
          }
          if (item.isClaimed) {
            if (ObjectId(user._id).equals(item.claimedBy)) {
              item = { ...item, claimedUserInfo: user };
              foundClaimed = true;
            }
          }
        }
        return {
          ...item,
          createdAt: helpers.formatDate(new Date(item.createdAt)),
          dateLostOrFound: helpers.formatDate(new Date(item.dateLostOrFound)),
        };
      });
    }

    return res.render("listing/myListings", {
      items,
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
    try {
      return res.render("item/create", {
        action: `/items/add`,
        title: "Add Item",
        metaData: {
          dateLostOrFound: {
            max: helpers.getDateString(new Date()),
            min: helpers.getDateString(
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            ),
          },
        },
      });
    } catch (e) {
      return res.status(404).sendFile(path.resolve("static/404.html"));
    }
  })
  .post(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      let itemObj;
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

        itemObj.description = xssCheck(itemObj?.description);

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
    let itemId, authenticatedUserId;
    try {
      itemId = checkId(req.params.id, "Item ID");
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || "Something went wrong",
      });
    }

    try {
      authenticatedUserId = req?.session?.passport?.user?._id;
      authenticatedUserId = checkId(authenticatedUserId, "User ID");
    } catch (e) {
      return res.status(400).send(e);
    }

    try {
      let item = await itemsDL.getItemById(itemId);
      let user = await userDL.getUserById(item?.createdBy);

      const allowEdit =
        ObjectId(user._id).equals(authenticatedUserId) && !item.isClaimed;

      return res.render("item/edit", {
        action: `/items/edit/${itemId}`,
        title: "Edit Item",
        allowEdit,
        item: {
          ...item,
          dateLostOrFound: helpers.getDateString(
            new Date(item.dateLostOrFound)
          ),
        },
        metaData: {
          dateLostOrFound: {
            max: helpers.getDateString(new Date()),
            min: helpers.getDateString(
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            ),
          },
        },
      });
    } catch (e) {
      return res.status(404).json({
        success: false,
        message: "Item or user not found",
      });
    }
  })
  .put(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
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
        if (!validations.isNameValid(itemObj?.name)) {
          throw new Error("Name field needs to have valid value");
        }

        itemObj.description = xssCheck(itemObj?.description);

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

      try {
        if (itemById.isClaimed) {
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
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: e.message || "Something went wrong",
        });
      }

      try {
        itemObj.updatedBy = checkId(req.headers["x-user-id"], "User ID");
        if (!ObjectId(itemObj.updatedBy).equals(itemById.createdBy)) {
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
  let id, comment, authenticatedUserId;

  try {
    id = req.params.id;
    comment = req.body.comment;
    authenticatedUserId = req?.session?.passport?.user?._id;

    id = xssCheck(id);
    id = checkId(id, "Item ID");
    authenticatedUserId = checkId(authenticatedUserId, "User ID");

    comment = xssCheck(comment);
    if (!helpers.isStringValid(comment)) {
      throw new Error("Cannot have empty comment");
    }
  } catch (e) {
    return res.status(400).render("error", {
      title: "error",
      message: e.message || "Something went wrong",
    });
  }

  try {
    let item = await itemsDL.createComment(comment, authenticatedUserId, id);
    return res.redirect("/items/" + id);
  } catch (e) {
    return res
      .status(500)
      .render("error", { message: e.message || "Something went wrong" });
  }
});

router.route("/:id/status").post(async (req, res) => {
  let itemId, theItem, theUser, action, finderOrOwner, idOfTheFinderOrClaimer;
  try {
    itemId = xssCheck(req.params.id);
    itemId = checkId(itemId, "Item ID");

    idOfTheFinderOrClaimer = req.session.passport.user._id;
    idOfTheFinderOrClaimer = checkId(idOfTheFinderOrClaimer, "User ID");
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }

  try {
    theItem = await itemsDL.getItemById(itemId);
    theUser = await userDL.getUserById(theItem.createdBy);
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: "Cannot find item or user",
    });
  }

  try {
    if (theItem.type == "lost") {
      action = "found";
      finderOrOwner = "finder";
    } else if (theItem.type == "found") {
      action = "claimed";
      finderOrOwner = "owner";
    }

    itIsClaimed = await itemsDL.updateIsClaimedStatus(
      itemId,
      idOfTheFinderOrClaimer
    );

    if (!itIsClaimed) throw new Error("Failed to update the status");

    if (itIsClaimed === "Item Already claimed") {
      return res.status(500).json({
        success: false,
        message: "Item already Claimed!",
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }

  try {
    let userFullName = theUser.firstName + " " + theUser.lastName;
    let actorFullName =
      req.session.passport.user.firstName +
      " " +
      req.session.passport.user.lastName;

    sendListingUpdateEmail(
      {
        user: xssCheck(theUser.firstName),
        userId: xssCheck(theUser.email),
        userItem: xssCheck(theItem.name),
        actor: xssCheck(actorFullName),
        actorId: xssCheck(req.session.passport.user.email),
        actorNumber: xssCheck(req.session.passport.user.phone),
        action: xssCheck(action),
        finderOrOwner: xssCheck(finderOrOwner),
      },
      res
    );

    if (finderOrOwner == "finder") {
      finderOrOwner = "owner";
    } else if (finderOrOwner == "owner") {
      finderOrOwner = "finder";
    }

    return sendListingUpdateEmailToActor(
      {
        user: xssCheck(userFullName),
        userId: xssCheck(theUser.email),
        userItem: xssCheck(theItem.name),
        userNumber: xssCheck(theUser.phone),
        actor: xssCheck(req.session.passport.user.firstName),
        actorId: xssCheck(req.session.passport.user.email),
        action: xssCheck(action),
        finderOrOwner: xssCheck(finderOrOwner),
      },
      res
    );
  } catch (e) {
    return res.status(500).json({
      success: true,
      emailSent: false,
      message: "Unable to send emails. Please contact website admin.",
    });
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    let id, user, item, authenticatedUserId;

    try {
      id = xssCheck(req.params.id);
      id = checkId(id, "Item ID");
    } catch (e) {
      return res.status(400).send(e);
    }

    try {
      item = await itemsDL.getItemById(id);
      item = {
        ...item,
        dateLostOrFound: helpers.formatDate(new Date(item.dateLostOrFound)),
        createdAt: helpers.formatDate(new Date(item.createdAt)),
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
        return { ...c, createdAt: helpers.formatDate(new Date(c.createdAt)) };
      });
      let userId = checkId(item.createdBy, "User ID");
      user = await userDL.getUserById(userId);
      authenticatedUserId = req?.session?.passport?.user?._id;

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
    } catch (e) {
      return res.status(500).send("Internal Server Error");
    }
  })
  .delete(async (req, res) => {
    // delete item
    let id, item, authenticatedUserId;

    try {
      id = xssCheck(req.params.id);
      id = checkId(id, "Item ID");
    } catch (e) {
      return res.status(400).send(e);
    }
    try {
      item = await itemsDL.getItemById(id);
    } catch (e) {
      return res.status(404).send("item not found");
    }

    try {
      authenticatedUserId = req?.session?.passport?.user?._id;
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
  let itemId, item, authenticatedUserId;

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
    item = await itemsDL.getItemById(itemId);
  } catch (e) {
    return res.status(404).send("Item not found");
  }

  try {
    authenticatedUserId = req?.session?.passport?.user?._id;
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
    try {
      if (item.isClaimed) {
        return res.status(401).json({
          success: false,
          message: "Item has already been claimed!",
        });
      }
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }

  try {
    let allUsers = await userDL.getAllUsers();
    let suggestions = await itemsDL.getItemSuggestions(itemId);

    if (suggestions?.length) {
      suggestions = (suggestions || []).map((item) => {
        for (let user of allUsers) {
          if (ObjectId(user._id).equals(item.createdBy)) {
            item = { ...item, userInfo: user };
            break;
          }
        }
        return {
          ...item,
          createdAt: helpers.formatDate(new Date(item.createdAt)),
          dateLostOrFound: helpers.formatDate(new Date(item.dateLostOrFound)),
        };
      });
    }

    return res.render("item/suggestions", {
      title: "Suggestions",
      item,
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
