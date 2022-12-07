// TODO: Deal With Sessions

const express = require("express");
const router = express.Router();
const { itemsDL } = require("../data");
const { checkId, helpers, validations } = require("../utils/helpers");
const { itemImageUpload } = require("../utils/multer");
const {
  sendListingUpdateEmail,
  sendListingUpdateEmailToActor,
} = require("../utils/mailer");
const itemFunctions = require("../data/items");
const userFunctions = require("../data/users");
const { itemsCollection } = require("../config/mongoCollections");
const { User } = require("./models/user.model");
const { usersCollection } = require("../config/mongoCollections");
const userFunctions = require("../data/users");

router.route("/listing").get(async (req, res) => {
  // item listing page - paginated
  return res.send("NOT IMPLEMENTED");
});

router.route("/my-listings/:id").get(async (req, res) => {
  // TODO (AMAN): Pagination
  
  let id = req.params.id;
  try {
    id = checkId(req.params.id, "Item ID");
  } catch (e) {
    console.log(e)
    return res.status(400).render("error",{
      class: "error",
      message: "Error: Invalid ID or ID Not Provided",
    });
  }

  try {
    const d = await itemFunctions.getItemsByUserId(id);

    res.render("/listing/userListings", {
      itemsData: d, title: "My Listings"
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
  theItem = itemFunctions.getItemById(req.body.itemId);

  // get user details
  theUser = userFunctions.getUserById(req.body.userId);

  if(theItem.type == "lost"){
    action = "Found"
  } else if(theItem.type == "found"){
    action = "Claim"
  }
  // update isClaimed status
  itIsClaimed = itemFunctions.updateIsClaimedStatus(itemId);

  if (!itIsClaimed) throw "Failed to update the status";

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

    if(!toUser) throw "Oops! Something Went Wrong: Failed to send email to user"
    if(!toActor) throw "Oops! Something Went Wrong: Failed to send email"

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
    //  item

    id = checkId(req.params.id, "Item ID");

    const theUser = await userFunctions.getUserByItemId(id)
    const userId = theUser._id

    const deletedItem = await itemFunctions.deleteItem(id);
    if(!deletedItem) throw "Could Not Delete Item"
    // res.status(200).json(deletedItem);

    // Render The My Listings Page After Deletion
    const d = await itemFunctions.getItemsByUserId(userId);

    res.render("/listing/userListings", {
      itemsData: d, title: "My Listings", itemDeleted: deletedItem
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
