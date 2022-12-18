import { helpers } from "/public/js/helpers.js";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    // sort
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

    // pagination
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

    // search
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");

    if (searchButton) {
      searchButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        document.getElementById("searchError").classList.add("hide");
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length < 3) {
          setTimeout(() => {
            document.getElementById("searchError").classList.remove("hide");
          }, 100);
          return;
        }
        const queryParams = helpers.getQueryParams(`${location.search}`);
        queryParams["search"] === searchTerm;
        queryParams["page"] = 1;
        const search = helpers.getRequestParams(queryParams);
        location.href = `${location.pathname}?${search}`;
      });
    }
  });
})();

// Get DOM Elements

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const claimModal = document.querySelector("#claimModal");
    const claimModalText = document.querySelector("#claimModalText");
    const claimModalTitle = document.querySelector("#claimModalTitle");
    const successModal = document.querySelector("#successModal");
    const confirmBtn = document.querySelector("#confirmBtn");

    function openClaimModal(id, type) {
      if (confirmBtn) {
        confirmBtn.setAttribute("data-id", id);
      }
      if (claimModal) {
        claimModal.style.display = "block";
        const closeBtn = document.getElementsByClassName("close-btn");
        if (closeBtn) {
          Array.from(closeBtn).forEach((btn) => {
            btn.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();

              closeClaimModal();
            });
          });
        }

        if (type === "found") {
          claimModalText.innerHTML =
            "Are you sure this item is yours and you want to claim it?";
          claimModalTitle.innerHTML = "Claim item?";
        } else if (type === "lost") {
          claimModalText.innerHTML = "Are you sure you have found this item?";
          claimModalTitle.innerHTML = "Found item?";
          claimModal.style.display = "block";
        }
      }
    }

    function closeClaimModal() {
      if (confirmBtn) {
        confirmBtn.setAttribute("data-id", "");
      }
      if (claimModal) {
        claimModal.style.display = "none";
        claimModalText.innerHTML = "";
        claimModalTitle.innerHTML = "";
      }
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const theItemId = event.target.getAttribute("data-id");

        fetch(`/items/${theItemId}/status`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res?.success) {
              successModal.style.display = "block";
              closeClaimModal();

              setTimeout(() => {
                successModal.style.display = "none";
                if (res?.emailSent === false) {
                  alert(res.message || "Error occurred while sending email.");
                }
                window.location.reload();
              }, 2000);
            } else {
              alert(res.message || "Something went wrong.");
            }
          })
          .catch((error) => {
            alert(error.message || "Something went wrong.");
          });
      });
    }

    //#region claim btn
    let claimButtons = document.getElementsByClassName("claim-button");
    if (claimButtons) {
      Array.from(claimButtons).forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          const itemId = event.target.getAttribute("data-id");
          const type = event.target.getAttribute("data-type");
          openClaimModal(itemId, type);
        });
      });
    }
    //#endregion
  });
})();
