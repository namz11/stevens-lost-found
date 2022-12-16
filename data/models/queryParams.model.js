const { helpers } = require("../../utils/helpers");

class QueryParams {
  constructor(values, defaultValues) {
    Object.assign(this, values);
    this.page = +this.page || 1;
    this.size = +this.size || 10;
    this.search = helpers.sanitizeString(this.search);
    this.sortBy =
      helpers.sanitizeString(this.sort) !== ""
        ? helpers.sanitizeString(this.sort)
        : defaultValues?.sortBy;
    this.sortOrder = +this.order || 1;
  }
}

module.exports = { QueryParams };
