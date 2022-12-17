const { helpers } = require("../../utils/helpers");

class QueryParams {
  constructor(values, defaultValues) {
    if (values) {
      Object.assign(this, values);
      this.page = +this.page || 1;
      this.size = +this.size || 10;
      this.search = helpers.sanitizeString(this.search);
      const sortField = helpers.sanitizeString(this.sortBy);

      if (sortField !== "") {
        this.sortBy =
          sortField === "dateAdded"
            ? "createdAt"
            : sortField === "actionDate"
            ? "dateLostOrFound"
            : defaultValues?.sortBy;
      } else {
        this.sortBy = defaultValues?.sortBy;
      }

      this.sortOrder = +this.sortOrder || 1;
    }
  }

  deserialize(query) {
    return {
      ...query,
      sortBy: query.sortBy === "dateLostOrFound" ? "actionDate" : "dateAdded",
    };
  }
}

module.exports = { QueryParams };
