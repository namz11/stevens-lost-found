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

// (function () {
//   document.addEventListener("DOMContentLoaded", function () {
//     // Handler when the DOM is fully loaded

//     const searchButton = document.getElementById("search-form-lost-button");

//     if (searchButton) {
//       searchButton.addEventListener("click", (event) => {
//         debugger;
//         event.preventDefault();
//         event.stopPropagation();
//         event.stopImmediatePropagation();

//         const searchInput = document.getElementById("search-form-lost-input");
//         const searchTerm = searchInput.value;

//         const buttonId = event.target.id;

//         $.ajax({
//           url: `/listing?search=${searchTerm}&buttonId=${buttonId}`,
//           method: "GET",
//           success: function (response) {
//             // Use response.data to access the list of items
//             const data1 = response.data1;

//             // Use response.noMatch to access the noMatch message
//             const noMatch = response.noMatch;

//             // Use the data and noMatch properties in your Handlebars view
//             const theData = {
//               data1: data1,
//               noMatch: noMatch,
//             };

//             var source = $(".lost").html();
//             var template = Handlebars.compile(source);
//             var html = template(theData);

//             // Add the rendered HTML to the page
//             $(".lost").html(html);
//           },
//         });
//       });
//     }
//   });
// })();

// (function () {
//   document.addEventListener("DOMContentLoaded", function () {
//     // Handler when the DOM is fully loaded

//     const searchButton = document.getElementById("search-form-found-button");

//     if (searchButton) {
//       searchButton.addEventListener("click", (event) => {
//         debugger;
//         event.preventDefault();
//         event.stopPropagation();
//         event.stopImmediatePropagation();

//         const searchInput = document.getElementById("search-form-found-input");
//         const searchTerm = searchInput.value;

//         const buttonId = event.target.id;

//         $.ajax({
//           url: `/listing?search=${searchTerm}&buttonId=${buttonId}`,
//           method: "GET",
//           success: function (response) {
//             // Use response.data to access the list of items
//             const data2 = response.data2;

//             // Use response.noMatch to access the noMatch message
//             const noMatch = response.noMatch;

//             // Use the data and noMatch properties in your Handlebars view
//             const theData = {
//               data2: data2,
//               noMatch: noMatch,
//             };

//             var source = $(".found").html();
//             var template = Handlebars.compile(source);
//             var html = template(theData);

//             // Add the rendered HTML to the page
//             $(".found").html(html);
//           },
//         });
//       });
//     }
//   });
// })();

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

// For Search
const searchButton = document.getElementById("search-form-button");
const searchInput = document.getElementById("search-form-input");

if (searchButton) {
  searchButton.addEventListener("click", (event) => {
    event.preventDefault();
    search();
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  });
}

function search() {
  const searchTerm = searchInput.value;
  console.log(searchTerm);
}
