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
    delete obj1.comments;
    delete obj1.isClaimed;
    delete obj1.createdAt;
    delete obj1.createdBy;
    delete obj1.updatedAt;
    delete obj1.updatedBy;

    delete obj2._id;
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
  getDateString: (date) => {
    if (helpers.isValidJSDate(date)) {
      let strDate = date.toISOString().split(":");
      return `${strDate[0]}:${strDate[1]}`;
    } else {
      throw new Error("Invalid Date");
    }
  },
  getQueryParams: (search) => {
    let queryParams = {};
    const params =
      search.split("?").length > 1 ? search.split("?")[1].split("&") : null;
    (params || []).forEach((param) => {
      param = param.split("=");
      queryParams[param[0]] = decodeURIComponent(param[1] || "");
    });
    return Object.keys(queryParams).length > 0
      ? queryParams
      : new QueryParams({}, { sortBy: "dateAdded" });
  },
  getRequestParams(queryParams) {
    let enCodedParamsStr = "";
    const keys = Object.keys(queryParams);
    keys.forEach((key) => {
      if (helpers.sanitizeString("" + queryParams[key]) !== "") {
        enCodedParamsStr += `${key}=${encodeURIComponent(
          helpers.sanitizeString("" + queryParams[key])
        )}&`;
      }
    });
    return enCodedParamsStr.replace(/\&$/, "");
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
  // isPictureValid: (str) => helpers.isStringValid(str, 8),
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
  isOTPValid: (otp) => +otp >= 1000 && +otp <= 9999,
};

const authHelpers = {
  checkEmail: (str) => {
    str = str.trim();
    if (!str) {
      throw new Error("Enter a email");
    }
    str = str.toLowerCase();
    const stevensEmailRegex = /^[a-zA-Z0-9_.+-]+@stevens.edu$/;
    if (!stevensEmailRegex.test(str)) {
      throw new Error(
        "Enter an email address from Stevens Institute of Technology"
      );
    }
    return str.toLowerCase();
  },
  checkPassword: (str) => {
    if (!str) {
      throw new Error("Enter a password");
    }

    const reg =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*\d)[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\d]{6,}$/g;
    if (!reg.test(str)) {
      throw new Error("Enter a valid password");
    }
    return str;
  },
  checkName: (str, varName) => {
    str = str.trim();
    if (!str) {
      throw new Error("Enter Name");
    }

    const reg = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;
    if (!reg.test(str)) {
      throw new Error(`Enter a valid ${varName}`);
    }

    return str;
  },
  checkDOB: (date) => {
    date = date.trim();
    if (!date) {
      throw new Error("Enter Date of Birth");
    }
    const reg = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/g;

    const regDate = new RegExp(
      "((0[13578]|1[02])[/.]31[/.](19|20)[0-9]{2})|((01|0[3-9]|1[1-2])[/.](29|30)[/.](19|20)[0-9]{2})|((0[1-9]|1[0-2])[/.](0[1-9]|1[0-9]|2[0-8])[/.](19|20|18)[0-9]{2})|((02)[/.]29[/.](((19|20)(04|08|[2468][048]|[13579][26]))|2000))"
    );

    if (!reg.test(date)) {
      throw new Error("Enter a Valid Date");
    }

    let d = date.split("-");
    let mainDateChecker = `${d[1]}/${d[2]}/${d[0]}`;

    var todaysDate = new Date();
    let yyyy = todaysDate.getFullYear() - 13;
    let mm = todaysDate.getMonth() + 1;
    let dd = todaysDate.getDate();

    let tDate = `${mm}/${dd}/${yyyy}`;

    const x = new Date(mainDateChecker);
    const y = new Date(tDate);
    if (!(+x <= +y)) {
      throw new Error("You need to be older than 13 Years");
    }

    if (!regDate.test(mainDateChecker)) {
      throw new Error("Enter a Valid Date");
    }

    return date;
  },
  checkPhoneNumber: (str) => {
    str = str.trim();
    if (!str) {
      throw new Error("Enter Name");
    }

    const reg = /^[0-9]{10,10}$/g;
    if (!reg.test(str)) {
      throw new Error("Enter a valid Phone Number");
    }
    return str;
  },
};

class QueryParams {
  constructor(values, defaultValues) {
    if (values) {
      Object.assign(this, values);
      this.page = +this.page || 1;
      this.size = +this.size || 10;
      this.search = helpers.sanitizeString(this.search);
      const sortField = helpers.sanitizeString(this.sort);

      if (sortField !== "") {
        this.sortBy =
          sortField === "dateAdded"
            ? "createdAt"
            : sortField === "actionDate"
            ? "dateLostOrFound"
            : defaultValues?.sortBy;
      } else {
        this.sortBy;
      }
      this.sortBy = defaultValues?.sortBy;

      this.sortOrder = +this.order || 1;
    }
  }

  deserialize(query) {
    return {
      ...query,
      sortBy: query.sortBy === "dateLostOrFound" ? "actionDate" : "createdAt",
    };
  }
}

export { helpers, regexValidators, validations, authHelpers };
