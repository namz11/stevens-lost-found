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
  let item1, item2, item3, item4, item5, item6; // lost items
  let item7, item8, item9, item10, item11, item12; // lost items
  let item13, item14, item15, item16, item17, item18; // lost items
  let item19, item20, item21; // lost items
  let item101, item102, item103, item104, item105, item106; // found items
  let item107, item108, item109, item110, item111, item112; // found items
  let item113, item114, item115, item116, item117, item118; // found items
  let item119, item120; // found items

  //#region users
  try {
    user1 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "narmit",
        lastName: "mashruwala",
        email: "nmashruw@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-02-23",
        password: hashedPassword,
        isVerified: true,
      })
    );
    user2 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "vatsal",
        lastName: "patel",
        email: "vpatel10@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-03-23",
        password: hashedPassword,
        isVerified: true,
      })
    );
    user3 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "aman",
        lastName: "patel",
        email: "apatel42@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-04-23",
        password: hashedPassword,
        isVerified: true,
      })
    );
    user4 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "bobby",
        lastName: "chaudhary",
        email: "lpavulur@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-05-23",
        password: hashedPassword,
        isVerified: true,
      })
    );
    user5 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "rushabh",
        lastName: "thakkar",
        email: "rthakka6@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-06-23",
        password: hashedPassword,
        isVerified: true,
      })
    );
    // TODO
    // email: "phill@stevens.edu",
    user6 = await userDL.enterUserFromSeedFile(
      ...Object.values({
        firstName: "patrick",
        lastName: "hill",
        email: "nmashruwadmin@stevens.edu",
        phoneNumber: "9876543210",
        dob: "2000-01-23",
        password: hashedPassword,
        isVerified: true,
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
      dateLostOrFound: "2022-11-26T13:31",
      lostOrFoundLocation: "gateway south",
      createdBy: user1._id,
    });
    item2 = await itemsDL.createItem({
      type: "lost",
      name: "earbuds",
      description: "nothing white earbuds signed by carl pei",
      picture: "uploads/nothing.jpeg",
      dateLostOrFound: "2022-11-25T14:30",
      lostOrFoundLocation: "bowling arena",
      createdBy: user3._id,
    });
    item3 = await itemsDL.createItem({
      type: "lost",
      name: "acer laptop",
      description: "acer laptop GREY color model abc34",
      picture: "uploads/acer.jpeg",
      dateLostOrFound: "2022-12-01T12:23",
      lostOrFoundLocation: "babio",
      createdBy: user3._id,
    });
    item4 = await itemsDL.createItem({
      type: "lost",
      name: "guess winter jacket",
      description: " black jacket with notes inside",
      picture: "uploads/guess-jacket.jpeg",
      dateLostOrFound: "2022-11-29T10:30",
      lostOrFoundLocation: "tennis court",
      createdBy: user1._id,
    });
    item5 = await itemsDL.createItem({
      type: "lost",
      name: "atilla attire",
      description: "atilla duck stevens mascot attire",
      picture: "uploads/atilla.jpg",
      dateLostOrFound: "2022-12-04T20:03",
      lostOrFoundLocation: "babio 3rd floor",
      createdBy: user5._id,
    });
    item6 = await itemsDL.createItem({
      type: "lost",
      name: "rayban glasses",
      description: "glasses in box, original rayban",
      picture: "uploads/glasses.png",
      dateLostOrFound: "2022-11-30T14:10",
      lostOrFoundLocation: "ucc techflex",
      createdBy: user2._id,
    });
    item7 = await itemsDL.createItem({
      type: "lost",
      name: "hard drive",
      description: "sony external hard drive",
      picture: "uploads/sony.jpeg",
      dateLostOrFound: "2022-12-01T20:00",
      lostOrFoundLocation: "pierce dining",
      createdBy: user2._id,
    });
    item8 = await itemsDL.createItem({
      type: "lost",
      name: "handbag dior",
      description:
        "dior handbag with personal belongings like lipstick, charger, jewelry etc",
      picture: "uploads/handbag.png",
      dateLostOrFound: "2022-12-06T15:01",
      lostOrFoundLocation: "howie 4th floor",
      createdBy: user1._id,
    });
    item9 = await itemsDL.createItem({
      type: "lost",
      name: "cwid 20222343 duckcard",
      description: "",
      picture: "uploads/duckcard.png",
      dateLostOrFound: "2022-11-18T09:00",
      lostOrFoundLocation: "buchard",
      createdBy: user4._id,
    });
    item10 = await itemsDL.createItem({
      type: "lost",
      name: "guess wallet",
      description: "wallet with 300$",
      picture: "uploads/wallet.png",
      dateLostOrFound: "2022-12-09T17:00",
      lostOrFoundLocation: "stevens shuttle gb777rr",
      createdBy: user2._id,
    });
    item11 = await itemsDL.createItem({
      type: "lost",
      name: "my dog - arya",
      description: "golden pup",
      picture: "uploads/dog.jpeg",
      dateLostOrFound: "2022-11-24T11:30",
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
      dateLostOrFound: "2022-12-10T12:00",
      lostOrFoundLocation: "UCC Gym",
      createdBy: user5._id,
    });
    item14 = await itemsDL.createItem({
      type: "lost",
      name: "Charger",
      description: "a white colour iphone charger",
      picture: "uploads/charger.png",
      dateLostOrFound: "2022-12-12T12:30",
      lostOrFoundLocation: "Library 2nd Floor",
      createdBy: user5._id,
    });
    item15 = await itemsDL.createItem({
      type: "lost",
      name: "Bag",
      description: "A red and black bag",
      picture: "uploads/bag.png",
      dateLostOrFound: "2022-12-11T12:51",
      lostOrFoundLocation: "Babbio 320",
      createdBy: user3._id,
    });
    item16 = await itemsDL.createItem({
      type: "lost",
      name: "Gloves",
      description: "Columbia Gloves",
      picture: "uploads/gloves.png",
      dateLostOrFound: "2022-12-10T23:59",
      lostOrFoundLocation: "North Gateway 1st floor",
      createdBy: user4._id,
    });
    item17 = await itemsDL.createItem({
      type: "lost",
      name: "Sun Glasses",
      description: "Club Master black sunglsses",
      picture: "uploads/sunglasses.png",
      dateLostOrFound: "2022-12-01T20:00",
      lostOrFoundLocation: "Tenis Count",
      createdBy: user2._id,
    });
    item18 = await itemsDL.createItem({
      type: "lost",
      name: "Computer Mouse",
      description: "black colour mouse",
      picture: "uploads/mouse.png",
      dateLostOrFound: "2022-12-06T15:01",
      lostOrFoundLocation: "North Building 210",
      createdBy: user1._id,
    });
    item19 = await itemsDL.createItem({
      type: "lost",
      name: "Water Bottle",
      description: "A tupperware waterbottle",
      picture: "uploads/bottle.png",
      dateLostOrFound: "2022-11-18T09:00",
      lostOrFoundLocation: "Howe center",
      createdBy: user4._id,
    });
    item20 = await itemsDL.createItem({
      type: "lost",
      name: "Notebook",
      description: "A notebook with spiral",
      picture: "",
      dateLostOrFound: "2022-12-09T17:00",
      lostOrFoundLocation: "Library 2nd floor",
      createdBy: user2._id,
    });
    item21 = await itemsDL.createItem({
      type: "lost",
      name: "Apple pencil",
      description: "A white apple pencil gen 2",
      picture: "",
      dateLostOrFound: "2022-11-24T11:30",
      lostOrFoundLocation: "Kiddie Hall",
      createdBy: user6._id,
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
      dateLostOrFound: "2022-12-10T23:59",
      lostOrFoundLocation: "north building",
      createdBy: user2._id,
    });
    item102 = await itemsDL.createItem({
      type: "found",
      name: "michael kors jacket",
      description: "winter jacket with hoodie",
      picture: "uploads/mk-jacket.jpeg",
      dateLostOrFound: "2022-12-09T17:00",
      lostOrFoundLocation: "outside gateway south",
      createdBy: user3._id,
    });
    item103 = await itemsDL.createItem({
      type: "found",
      name: "duckcard",
      description: "20112468 cwid card",
      picture: "uploads/duckcard2.png",
      dateLostOrFound: "2022-12-11T12:51",
      lostOrFoundLocation: "babio viewing area",
      createdBy: user3._id,
    });
    item104 = await itemsDL.createItem({
      type: "found",
      name: "samsung pen",
      description: "stylus pen",
      picture: "uploads/samsung-pen.jpg",
      dateLostOrFound: "2022-12-03T19:00",
      lostOrFoundLocation: "ucc",
      createdBy: user1._id,
    });
    item105 = await itemsDL.createItem({
      type: "found",
      name: "ipad",
      description: "ipad black",
      picture: "uploads/ipad.png",
      dateLostOrFound: "2022-11-29T12:00",
      lostOrFoundLocation: "babio 6rd floor",
      createdBy: user5._id,
    });
    item106 = await itemsDL.createItem({
      type: "found",
      name: "credit card",
      description: "amex gold credit card",
      picture: "uploads/cc.jpeg",
      dateLostOrFound: "2022-11-19T13:45",
      lostOrFoundLocation: "ucc techflex",
      createdBy: user2._id,
    });
    item107 = await itemsDL.createItem({
      type: "found",
      name: "duckcard-2144402",
      description: "sony external hard drive",
      picture: "uploads/duckcard3.png",
      dateLostOrFound: "2022-12-01T14:05",
      lostOrFoundLocation: "library",
      createdBy: user2._id,
    });
    item108 = await itemsDL.createItem({
      type: "found",
      name: "maybeline lipstick",
      description:
        "dior handbag with personal belongings like lipstick, charger, jewelry etc",
      picture: "uploads/lipstick.jpeg",
      dateLostOrFound: "2022-12-09T10:45",
      lostOrFoundLocation: "gym",
      createdBy: user1._id,
    });
    item109 = await itemsDL.createItem({
      type: "found",
      name: "cowboy hat",
      description: "",
      picture: "uploads/hat.jpeg",
      dateLostOrFound: "2022-12-05T14:00",
      lostOrFoundLocation: "football ground",
      createdBy: user4._id,
    });
    item110 = await itemsDL.createItem({
      type: "found",
      name: "card wallet",
      description: "wallet with many cards",
      picture: "uploads/wallet2.jpg",
      dateLostOrFound: "2022-11-24T12:13",
      lostOrFoundLocation: "admin office",
      createdBy: user2._id,
    });
    item111 = await itemsDL.createItem({
      type: "found",
      name: "Laptop sleeve ",
      description: "a blue laptop sleeve",
      picture: "uploads/sleeve.png",
      dateLostOrFound: "2022-11-19T13:45",
      lostOrFoundLocation: "UCC Gallery",
      createdBy: user2._id,
    });
    item112 = await itemsDL.createItem({
      type: "found",
      name: "A gym shaker",
      description: "A black shaker",
      picture: "uploads/shaker.png",
      dateLostOrFound: "2022-12-09T16:00",
      lostOrFoundLocation: "Schaefer Gym",
      createdBy: user3._id,
    });
    item113 = await itemsDL.createItem({
      type: "found",
      name: "Electric Scooter",
      description: "Hiboy Scooter",
      picture: "uploads/scooter.png",
      dateLostOrFound: "2022-11-20T15:35",
      lostOrFoundLocation: "outside howe center",
      createdBy: user3._id,
    });
    item114 = await itemsDL.createItem({
      type: "found",
      name: "Powerbank",
      description: "a white powerbank",
      picture: "uploads/powerbank.png",
      dateLostOrFound: "2022-12-04T13:41",
      lostOrFoundLocation: "Library",
      createdBy: user1._id,
    });
    item115 = await itemsDL.createItem({
      type: "found",
      name: "Keys",
      description: "bunch of keys with stevens keychain",
      picture: "uploads/keys.png",
      dateLostOrFound: "2022-11-29T19:40",
      lostOrFoundLocation: "Pierce Dining",
      createdBy: user5._id,
    });
    item116 = await itemsDL.createItem({
      type: "found",
      name: "Book",
      description: "Think and grow rich by N Hill",
      picture: "uploads/cc.jpeg",
      dateLostOrFound: "2022-11-19T13:45",
      lostOrFoundLocation: "palmer garden",
      createdBy: user2._id,
    });
    item117 = await itemsDL.createItem({
      type: "found",
      name: "Iphone",
      description: "iphone 14 pro deep purple",
      picture: "",
      dateLostOrFound: "2022-12-01T14:05",
      lostOrFoundLocation: "Tech flex",
      createdBy: user2._id,
    });
    item118 = await itemsDL.createItem({
      type: "found",
      name: "Cap",
      description: "A black nike cap",
      picture: "uploads/cap.jpeg",
      dateLostOrFound: "2022-12-09T10:45",
      lostOrFoundLocation: "gym",
      createdBy: user1._id,
    });
    item119 = await itemsDL.createItem({
      type: "found",
      name: "Macbook air",
      description: "A gold colour macbook",
      picture: "uploads/macbook.jpeg",
      dateLostOrFound: "2022-12-05T14:00",
      lostOrFoundLocation: "football ground",
      createdBy: user4._id,
    });
    item120 = await itemsDL.createItem({
      type: "found",
      name: "Pendrive",
      description: "128GB sony pendrive",
      picture: "",
      dateLostOrFound: "2022-11-24T12:13",
      lostOrFoundLocation: "admin office",
      createdBy: user2._id,
    });
  } catch (e) {
    console.log(e);
  }
  //#endregion
  // await connection.closeConnection();

  console.log("DB seed successful. There are 6 users & 31 items.");
  await connection.closeConnection();
};

main();
