const modal = document.querySelector("#modal");
const modalBtn = document.querySelector("#modal-btn");
const closeBtn = document.querySelector(".close");
const innerModal = document.querySelector("#modal-inner");
const confirmNoBtn = document.querySelector("#confirm-no-btn");
const confirmYesBtn = document.querySelector("#confirm-yes-btn");
const closeBtnInner = document.querySelector("#close-btn-inner");
const closeBtnInnerFlat = document.querySelector("#close-btn-inner-flat");

// To Open Individual Item Listing when
let detailsButton = document.querySelector("#details-btn");
detailsButton.addEventListener("click", (event) => {
  event.preventDefault();
  const buttonItemId = event.target.getAttribute("data-button");
  //TODO Check if this works properly
  const theUrl = `/${buttonItemId}`; //TODO Little Changes To Open The Item Page
  window.open(theUrl, "_blank") || window.location.replace(theUrl);
});

// let editButton = document.querySelector('#edit-btn');
// editButton.addEventListener('click', (event)=>{
//   event.preventDefault()
//   const editButtonItemId = event.target.getAttribute("data-button");
//   //TODO Check if this works properly
//   const theUrl = `/edit/${editButtonItemId}` //TODO Little Changes To Open The Item Page
//     window.open(theUrl,
//     "_blank") || window.location.replace(theUrl); });

// let deleteButton = document.querySelector('#delete-btn');
// deleteButton.addEventListener('click', (event)=>{
//   event.preventDefault()
//   const deleteButtonItemId = event.target.getAttribute("data-button");
//   //TODO Check if this works properly
//   const theUrl = `/${deleteButtonItemId}` //TODO Little Changes To Open The Item Page
//   window.open(theUrl,
//       "_blank") || window.location.replace(theUrl); });

// Events
modalBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);

confirmNoBtn.addEventListener("click", closeModal);
confirmYesBtn.addEventListener("click", openModal2);

closeBtnInner.addEventListener("click", closeModal2);
closeBtnInnerFlat.addEventListener("click", closeModal2);

// Open Main Model
function openModal() {
  modal.style.display = "block";
}

// Open Model 2s (It will close Main Modal and Open Modal 2)
function openModal2() {
  innerModal.style.display = "block";
  modal.style.display = "none";
}

// Close Main Modal
function closeModal() {
  modal.style.display = "none";
}

// Close Modal 2 (which will close innerModal)
function closeModal2() {
  innerModal.style.display = "none";
}

// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    //#region confirm btn
    const confirmButton = document.querySelector("#confirm-yes-btn");
    if (confirmButton) {
      confirmButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        const theItemId = event.target.getAttribute("data-id");
        const theUserId = event.target.getAttribute("data-user");

        data = {
          itemId: theItemId,
          userId: theUserId,
        };

        fetch(`/${theItemId}/status`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
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
    }
    //#endregion

    //#region edit btn
    let editButton = document.querySelector("#edit-btn");
    if (editButton) {
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        const theItemId = event.target.getAttribute("data-id");

        data = {
          itemId: theItemId,
        };

        fetch(`/edit/${theItemId}`, {
          method: "GET", //Get Item Edit Page
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
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
    }
    //#endregion

    //#region delete btn
    let deleteButton = document.querySelector("#delete-btn");
    if (deleteButton) {
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        const theItemId = event.target.getAttribute("data-id");

        data = {
          itemId: theItemId,
        };

        fetch(`/items/${theItemId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res.success) {
              alert(res.message || "Item Deleted");
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
    //#endregion
  });
})();

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper("ifNot", function (v1, v2, options) {
  if (v1 !== v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});