import { helpers, validations } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const claimButtons = document.getElementsByClassName("claim-btn");
    if (claimButtons) {
      Array.from(claimButtons).forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();

          const itemId = event.target.getAttribute("data-id");

          fetch(`/items/${itemId}/status`, {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: true,
            }),
          })
            .then((resp) => resp.json())
            .then((res) => {
              if (res.success) {
                alert(res.message || "Item Claimed");
                location.href = "/items/my-listing";
              } else {
                alert(res.message || "Something went wrong.");
              }
            })
            .catch((error) => {
              alert(error.message || "Something went wrong.");
            });
        });
      });
    }
  });
})();
