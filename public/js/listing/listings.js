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
        });
      });
    }
  });
})();
