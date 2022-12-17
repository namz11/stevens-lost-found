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
const modal = document.querySelector("#modal");
const modalBtn = document.querySelector("#modal-btn");
const closeBtn = document.querySelector(".close");
const modal2 = document.querySelector("#modal-inner");
const confirmNoBtn = document.querySelector("#confirm-no-btn");
const confirmYesBtn = document.querySelector("#confirm-yes-btn");

// Events
modalBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);

confirmNoBtn.addEventListener("click", closeModal);
confirmYesBtn.addEventListener("click", openModal2);

// Open Main Model
function openModal(id) {
  const modal = document.querySelector("#modal");
  const confirmYesBtn = document.querySelector("#confirm-yes-btn");
  if (confirmYesBtn) {
    confirmYesBtn.setAttribute("data-id", id);
  }
  if (modal) {
    modal.style.display = "block";
  }
}

function openModal2() {
  modal2.style.display = "block";
  modal.style.display = "none";

  setTimeout(function () {
    modal2.style.display = "none";
  }, 3500);
}

// Close Main Modal
function closeModal() {
  const modal = document.querySelector("#modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const confirmButton = document.querySelector("#confirm-yes-btn");

    if (confirmButton) {
      confirmButton.addEventListener("click", (event) => {
        event.preventDefault();

        const theItemId = event.target.getAttribute("data-id");
        const theUserId = event.target.getAttribute("data-user");

        console.log(theItemId);

        let data = {
          itemId: theItemId,
          userId: theUserId,
        };

        console.log(`/items/${theItemId}/status`);
        console.log(`/${theItemId}/status`);

        fetch(`/items/${theItemId}/status`, {
          // fetch(`/${theItemId}/status`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          // .then((resp) => resp.json())
          .then((resp) => {
            console.log(resp.status);
            return resp.json();
          })
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
    }
    //#region claim btn
    let claimButtons = document.getElementsByClassName("claim-button");
    if (claimButtons) {
      Array.from(claimButtons).forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          const theItemId = event.target.getAttribute("data-id");
          openModal(theItemId);
        });
      });
    }
    //#endregion
  });
})();
