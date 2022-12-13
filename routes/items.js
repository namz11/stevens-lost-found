const express = require("express");
const router = express.Router();
//const { itemsDL } = require("../data");
const { checkId, helpers, validations } = require("../utils/helpers");
const { itemImageUpload } = require("../utils/multer");
const {
  sendListingUpdateEmail,
  sendListingUpdateEmailToActor,
} = require("../utils/mailer");
const { itemsDL, userDL } = require("../data");

router.route("/listing").get(async (req, res) => {
  // item listing page - paginated
  const page1 = parseInt(req.query.page1) || 1;
  const page2 = parseInt(req.query.page2) || 1;
  let limit = 10;
  const startIndex1 = (page1 - 1) * limit;
  const endIndex1 = page1 * limit;
  const startIndex2 = (page2 - 1) * limit;
  const endIndex2 = page2 * limit;

  let data1 = await itemsDL.fetchingLostData();
  let data2 = await itemsDL.fetchingFoundData();
  let sortItem2 = "createdAt";
  let sortItem1 = "createdAt";
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

  data1 = data1.sort({ sortItem1: -1 }).slice(startIndex1, endIndex1);
  data2 = data2.sort({ sortItem2: -1 }).slice(startIndex2, endIndex2);
  try {
    if (!data1 && !data2) {
      return new Error("Data not found");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(new Error(e.message));
  }

  return res.render("listing", { data1: data1, data2: data2 });
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

    res.render("/listing/userListings", {
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
        return res.status(500).send(new Error(e.message));
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
        console.log(e);
        return res.status(400).send(new Error(e.message));
      }

      try {
        const newItem = await itemsDL.createItem(itemObj);
        return res.send({
          success: true,
          message: "Item created!",
          data: newItem,
        });
      } catch (e) {
        console.log(e);
        return res.status(500).send(new Error(e.message));
      }
    }
  );

router
  .route("/edit/:id")
  .get(async (req, res) => {
    // edit item page
    let itemId;
    try {
      id = checkId(req.params.id, "Item ID");
    } catch (e) {
      return res.status(400).send(new Error(e.message));
    }

    try {
      // TODO replace dummy
      // let item = await itemsDL.getItemById(itemId);
      let item = {
        type: "found",
        name: "Pear Dao",
        description: "abcd",
        picture: "uploads/1669571684253_ReadyPlayerMe-Avatar.png",
        dateLostOrFound: helpers.getDate(new Date(1667580840000)),
        lostOrFoundLocation: "babio",
        comments: [],
        isClaimed: false,
        createdAt: 1669571707850,
        createdBy: "",
        updatedAt: 1669571707850,
        updatedBy: "",
      };

      return res.render("item/edit", {
        action: `/items/edit/${itemId}`,
        item,
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
      res.status(404).json({ error: "Item not found" });
    }
  })
  .put(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      itemImageUpload(req, res, function (err) {
        if (err) {
          console.log("cs " + err);
          return;
        }
      });

      let itemId, itemObj;

      try {
        itemObj = req.body;
        itemObj.picture = req?.file?.path;
      } catch (e) {
        console.log(e);
        return res.status(500).send(new Error(e.message));
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
        console.log(e);
        return res.status(400).send(new Error(e.message));
      }

      try {
        itemById = await itemsDL.getMovieById(movieId);
      } catch (e) {
        return res.status(404).json({ error: "Item not found" });
      }

      // TODO uncomment
      // if (helpers.compareItemObjects(itemById, itemObj)) {
      //   return res
      //     .status(400)
      //     .json({ error: "Please change atleast 1 value to update" });
      // }

      // TODO check for user

      try {
        const updatedItem = await itemsDL.updateItem(itemId, itemObj);
        return res.json({
          success: true,
          message: "Item updated!",
          data: updatedItem,
        });
      } catch (e) {
        return res.status(500).send(new Error(e.message));
      }
    }
  );

router.route("/:id/comment").post(async (req, res) => {
  // add comment
  return res.send("NOT IMPLEMENTED");
});

router.route("/:id/status").put(async (req, res) => {
  // TODO (AMAN): Pass Actor Details Using Session

  // get item details
  theItem = itemsDL.getItemById(req.body.itemId);

  // get user details
  theUser = userDL.getUserById(req.body.userId);

  // update isClaimed status
  itIsClaimed = itemsDL.updateIsClaimedStatus(itemId);

  if (!itIsClaimed) throw "Failed to update the status";

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
    // item page
    return res.send("NOT IMPLEMENTED");
  })
  .delete(async (req, res) => {
    // delete item

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
  });

router.route("/:id/suggestions").get(async (req, res) => {
  // TODO validations
  let itemId;
  try {
    itemId = checkId(req.params.id, "Item ID");
  } catch (e) {
    return res.status(400).send(e);
  }

  try {
    const suggestions = await itemsDL.getItemSuggestions(itemId);
    return res.render("item/suggestions", {
      suggestions,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;
