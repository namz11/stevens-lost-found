const express = require("express");
const router = express.Router();
const path = require("path"); // can you for static files if needed

router.route("/listing").get(async (req, res) => {
  // item listing page - paginated
});

router
  .route("/:id")
  .get(async (req, res) => {
    // item page
  })
  .delete(async (req, res) => {
    // delete item
  });

router.route("/my-listings").get(async (req, res) => {
  // my listing page - paginated
});

router
  .route("/add/:id")
  .get(async (req, res) => {
    // create/edit item page
  })
  .post(async (req, res) => {
    // post new item
  })
  .put(async (req, res) => {
    // edit item
  });

router.route("/:id/comment").post(async (req, res) => {
  // add comment
});

router.route("/:id/status").put(async (req, res) => {
  // update isClaimed status
});

module.exports = router;
