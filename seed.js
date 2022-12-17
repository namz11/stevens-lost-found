// create 4 users

// create found 10 items
// create found 10 items

// create comments on each item

const { itemsDL, userDL } = require("./data");
const connection = require("./config/mongoConnection");
const bcrypt = require("bcryptjs");
const { helpers } = require("./utils/helpers");

const main = async () => {
  const db = await connection.dbConnection();
  await db.dropDatabase();

  const hashedPassword = await bcrypt.hash(
    helpers.sanitizeString("Admin@123"),
    10
  );

  let user1, user2, user3, user4, user5, user6;
  let item1, item2, item3, item4, item5, item6, item7; // lost items
  let item8, item9, item10, item11, item12, item13; // lost items
  let item14, item15, item16; // lost items
  let item101, item102, item103, item104, item105, item106; // found items
  let item107, item108, item109, item110, item111, item112; // found items
  let item113, item114, item115; // found items

  //#region users
  try {
    user1 = await userDL.enterUser(
      ...Object.values({
        firstName: "narmit",
        lastName: "mashruwala",
        email: "nmashruw@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
    user2 = await userDL.enterUser(
      ...Object.values({
        firstName: "vatsal",
        lastName: "patel",
        email: "vpatel10@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
    user3 = await userDL.enterUser(
      ...Object.values({
        firstName: "aman",
        lastName: "patel",
        email: "apatel42@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
    user4 = await userDL.enterUser(
      ...Object.values({
        firstName: "bobby",
        lastName: "chaudhary",
        email: "lpavulur@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
    user5 = await userDL.enterUser(
      ...Object.values({
        firstName: "rushabh",
        lastName: "thakkar",
        email: "rthakka6@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
    // TODO
    // email: "phill@stevens.edu",
    user6 = await userDL.enterUser(
      ...Object.values({
        firstName: "patrick",
        lastName: "hill",
        email: "nmashruwadmin@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
      })
    );
  } catch (e) {
    console.log(e);
  }
  //#endregion

  //#region lost items
  try {
    item1 = await itemsDL.createItem({
      type: "lost",
      name: "macbook pro",
      description: "m1 macbook pro 2021 model, space gray",
      picture: "uploads/macbook-pro.png",
      dateLostOrFound: "2022-12-06T23:31",
      lostOrFoundLocation: "gateway south",
      createdBy: user1._id,
    });
    item2 = await itemsDL.createItem({
      type: "lost",
      name: "earbuds",
      description: "nothing white earbuds signed by carl pei",
      picture: "uploads/nothing.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "bowling arena",
      createdBy: user3._id,
    });
    item3 = await itemsDL.createItem({
      type: "lost",
      name: "acer laptop",
      description: "acer laptop GREY color model abc34",
      picture: "uploads/acer.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "babio",
      createdBy: user3._id,
    });
    item4 = await itemsDL.createItem({
      type: "lost",
      name: "guess winter jacket",
      description: " black jacket with notes inside",
      picture: "uploads/guess-jacket.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "tennis court",
      createdBy: user1._id,
    });
    item5 = await itemsDL.createItem({
      type: "lost",
      name: "atilla attire",
      description: "atilla duck stevens mascot attire",
      picture: "uploads/atilla.jpg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "babio 3rd floor",
      createdBy: user5._id,
    });
    item6 = await itemsDL.createItem({
      type: "lost",
      name: "rayban glasses",
      description: "glasses in box, original rayban",
      picture: "uploads/glasses.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "ucc techflex",
      createdBy: user2._id,
    });
    item7 = await itemsDL.createItem({
      type: "lost",
      name: "hard drive",
      description: "sony external hard drive",
      picture: "uploads/sony.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "pierce dining",
      createdBy: user2._id,
    });
    item8 = await itemsDL.createItem({
      type: "lost",
      name: "handbag dior",
      description:
        "dior handbag with personal belongings like lipstick, charger, jewelry etc",
      picture: "uploads/handbag.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "howie 4th floor",
      createdBy: user1._id,
    });
    item9 = await itemsDL.createItem({
      type: "lost",
      name: "cwid 20222343 duckcard",
      description: "",
      picture: "uploads/duckcard.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "buchard",
      createdBy: user4._id,
    });
    item10 = await itemsDL.createItem({
      type: "lost",
      name: "guess wallet",
      description: "wallet with 300$",
      picture: "uploads/wallet.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "stevens shuttle gb777rr",
      createdBy: user2._id,
    });
    item11 = await itemsDL.createItem({
      type: "lost",
      name: "my dog - arya",
      description: "golden pup",
      picture: "uploads/dog.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "near griffit building side walk",
      createdBy: user6._id,
    });
    item12 = await itemsDL.createItem({
      type: "lost",
      name: "Umbrella",
      description: "A black colour umbrella",
      picture: "uploads/umbrella.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "South Gateway 222",
      createdBy: user2._id,
    });
    item13 = await itemsDL.createItem({
      type: "lost",
      name: "watch",
      description: "Dilang Automatic Watch",
      picture: "uploads/watch.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "UCC Gym",
      createdBy: user2._id,
    });
    item14 = await itemsDL.createItem({
      type: "lost",
      name: "Charger",
      description: "a white colour iphone charger",
      picture: "uploads/charger.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "Library 2nd Floor",
      createdBy: user2._id,
    });
    item15 = await itemsDL.createItem({
      type: "lost",
      name: "Bag",
      description: "A red and black bag",
      picture: "uploads/bag.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "Babbio ",
      createdBy: user2._id,
    });
    item16 = await itemsDL.createItem({
      type: "lost",
      name: "guess wallet",
      description: "wallet with 300$",
      picture: "uploads/wallet.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "stevens shuttle gb777rr",
      createdBy: user2._id,
    });
  } catch (e) {
    console.log(e);
  }
  //#endregion

  //#region found items
  try {
    item101 = await itemsDL.createItem({
      type: "found",
      name: "macbook air laptop",
      description: "m1 macbook air 2021 model, pink ",
      picture: "uploads/macbook-air.jpg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "north building",
      createdBy: user2._id,
    });
    item102 = await itemsDL.createItem({
      type: "found",
      name: "michael kors jacket",
      description: "winter jacket with hoodie",
      picture: "uploads/mk-jacket.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "outside gateway south",
      createdBy: user3._id,
    });
    item103 = await itemsDL.createItem({
      type: "found",
      name: "duckcard",
      description: "20112468 cwid card",
      picture: "uploads/duckcard2.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "babio viewing area",
      createdBy: user3._id,
    });
    item14 = await itemsDL.createItem({
      type: "found",
      name: "samsung pen",
      description: "stylus pen",
      picture: "uploads/samsung-pen.jpg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "ucc",
      createdBy: user1._id,
    });
    item105 = await itemsDL.createItem({
      type: "found",
      name: "ipad",
      description: "ipad black",
      picture: "uploads/ipad.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "babio 6rd floor",
      createdBy: user5._id,
    });
    item106 = await itemsDL.createItem({
      type: "found",
      name: "credit card",
      description: "amex gold credit card",
      picture: "uploads/cc.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "ucc techflex",
      createdBy: user2._id,
    });
    item107 = await itemsDL.createItem({
      type: "found",
      name: "duckcard-2144402",
      description: "sony external hard drive",
      picture: "uploads/duckcard3.png",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "library",
      createdBy: user2._id,
    });
    item108 = await itemsDL.createItem({
      type: "found",
      name: "maybeline lipstick",
      description:
        "dior handbag with personal belongings like lipstick, charger, jewelry etc",
      picture: "uploads/lipstick.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "gym",
      createdBy: user1._id,
    });
    item109 = await itemsDL.createItem({
      type: "found",
      name: "cowboy hat",
      description: "",
      picture: "uploads/hat.jpeg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "football ground",
      createdBy: user4._id,
    });
    item110 = await itemsDL.createItem({
      type: "found",
      name: "card wallet",
      description: "wallet with many cards",
      picture: "uploads/wallet2.jpg",
      dateLostOrFound: "2022-12-02T23:31",
      lostOrFoundLocation: "admin office",
      createdBy: user2._id,
    });
  } catch (e) {
    console.log(e);
  }
  //#endregion
  // await connection.closeConnection();

  console.log("DB seed successful. There are 6 users & 21 items.");
  await connection.closeConnection();
};

main();
