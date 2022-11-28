const { ObjectId } = require("mongodb");

const checkId = (id, varName) => {
  if (!id) throw `Error: You must provide a ${varName}`;
  if (typeof id !== "string") throw `Error:${varName} must be a string`;
  id = id.trim();
  if (id.length === 0)
    throw `Error: ${varName} cannot be an empty string or just spaces`;
  if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
  return id;
};

const regexValidators = {
  alphanumericRegex: /^[0-9a-zA-Z ]+$/,
  alphabetRegex: /^[a-zA-Z ]+$/,
  fullNameRegex: /[A-Za-z]{3,}\s[A-Za-z]{3,}$/,
  emailRegex:
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
};

const helpers = {
  // Check for valid string
  isStringValid: (str, charCount = 1) => {
    if (str === undefined || str === null || typeof str !== "string") {
      return false;
    }
    str = str.trim();

    return !isNaN(str) ? false : str && str?.length >= charCount;
  },
  // sanitize string
  sanitizeString: (str) => {
    if (str === undefined || str === null || typeof str !== "string") {
      return "";
    }
    return (str || "").trim();
  },
  // Check for valid number
  isNumberValid: (value) => {
    value = +value;
    return typeof value === "number" ? (value > 0 ? true : false) : false;
  },
  // Check for comparing itemObj
  compareItemObjects: (obj1, obj2) => {
    obj1 = { ...obj1 };
    obj2 = { ...obj2 };

    delete obj1._id;
    delete obj2.type;
    delete obj1.comments;
    delete obj1.isClaimed;
    delete obj1.createdAt;
    delete obj1.createdBy;
    delete obj1.updatedAt;
    delete obj1.updatedBy;

    delete obj2._id;
    delete obj2.type;
    delete obj2.comments;
    delete obj2.isClaimed;
    delete obj2.createdAt;
    delete obj2.createdBy;
    delete obj2.updatedAt;
    delete obj2.updatedBy;

    return _.isEqual(obj1, obj2);
  },
  isValidJSDate: (date) => date instanceof Date && !isNaN(date),
  // gives datetime in format yyyy-mm-ddTHH:MM
  getDate: (date) => {
    if (helpers.isValidJSDate(date)) {
      let strDate = date.toISOString().split(":");
      return `${strDate[0]}:${strDate[1]}`;
    } else {
      throw "Invalid Date";
    }
  },
};

const validations = {
  isNameValid: (str) => {
    return helpers.isStringValid(str, 2);
  },
  isTypeValid: (str) => {
    str = helpers.sanitizeString(str).toLowerCase();
    return str === "lost" || str === "found" ? str : false;
  },
  // isDescriptionValid: (str) => helpers.isStringValid(str, 10),
  isPictureValid: (str) => helpers.isStringValid(str, 8),
  isDateValid: (dateStr) => {
    dateStr = helpers.sanitizeString(dateStr);
    if (!helpers.isValidJSDate(new Date(dateStr))) {
      return false;
    }
    const now = new Date().valueOf();
    const min = new Date(
      new Date().setFullYear(new Date().getFullYear() - 1).valueOf()
    );
    const date = new Date(dateStr).valueOf();
    return date >= min && date <= now;
  },
  isLocationValid: (str) => helpers.isStringValid(str, 2),
};

module.exports = { helpers, regexValidators, validations, checkId };
