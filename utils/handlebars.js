const register = function (Handlebars) {
  const helpers = {
    // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
    compare: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

      var operator = options.hash.operator || "==";

      var operators = {
        "==": function (l, r) {
          return l == r;
        },
        "===": function (l, r) {
          return l === r;
        },
        "!=": function (l, r) {
          return l != r;
        },
        "<": function (l, r) {
          return l < r;
        },
        ">": function (l, r) {
          return l > r;
        },
        "<=": function (l, r) {
          return l <= r;
        },
        ">=": function (l, r) {
          return l >= r;
        },
        typeof: function (l, r) {
          return typeof l == r;
        },
      };

      if (!operators[operator])
        throw new Error(
          "Handlerbars Helper 'compare' doesn't know the operator " + operator
        );

      var result = operators[operator](lvalue, rvalue);

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
  };

  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (let prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    return helpers;
  }
};

module.exports.register = register;
module.exports.helpers = register(null);
