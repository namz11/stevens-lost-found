import { helpers } from "/public/js/helpers.js";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const sortButtons = document.getElementsByClassName("sort-item");
    if (sortButtons) {
      Array.from(sortButtons).forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();

          const sortBy = event.target.getAttribute("data-field");
          const queryParams = helpers.getQueryParams(location.search);
          if (queryParams.sortBy === sortBy) {
            queryParams["sortOrder"] = -+queryParams["sortOrder"];
          } else {
            queryParams["sortBy"] = sortBy;
            queryParams["sortOrder"] = 1;
          }
          queryParams["page"] = 1;
          const search = helpers.getRequestParams(queryParams);
          location.href = `${location.pathname}?${search}`;
        });
      });
    }
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        const queryParams = helpers.getQueryParams(location.search);
        queryParams["page"] = +queryParams["page"] - 1;
        const search = helpers.getRequestParams(queryParams);
        location.href = `${location.pathname}?${search}`;
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        const queryParams = helpers.getQueryParams(location.search);
        queryParams["page"] = +queryParams["page"] + 1;
        const search = helpers.getRequestParams(queryParams);
        location.href = `${location.pathname}?${search}`;
      });
    }
  });
})();
