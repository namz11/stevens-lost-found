const { ObjectId } = require("mongodb");

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
  checkId: (id, varName) => {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },
  // Check for valid number
  isNumberValid: (value) => {
    value = +value;
    return typeof value === "number" ? (value > 0 ? true : false) : false;
  },
};

module.exports = {
  helpers,
  regexValidators,
};
