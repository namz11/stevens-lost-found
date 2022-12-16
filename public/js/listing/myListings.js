// const modalBtn = document.querySelector("#modal-btn");
// const closeBtn = document.querySelector(".close");
// const innerModal = document.querySelector("#modal-inner");
// const confirmNoBtn = document.querySelector("#confirm-no-btn");
// const confirmYesBtn = document.querySelector("#confirm-yes-btn");
// const closeBtnInner = document.querySelector("#close-btn-inner");
// const closeBtnInnerFlat = document.querySelector("#close-btn-inner-flat");

// // To Open Individual Item Listing when
// let detailsButton = document.querySelector("#details-btn");
// detailsButton.addEventListener("click", (event) => {
//   event.preventDefault();
//   const buttonItemId = event.target.getAttribute("data-button");
//   //TODO Check if this works properly
//   const theUrl = `/${buttonItemId}`; //TODO Little Changes To Open The Item Page
//   window.open(theUrl, "_blank") || window.location.replace(theUrl);
// });

// // let editButton = document.querySelector('#edit-btn');
// // editButton.addEventListener('click', (event)=>{
// //   event.preventDefault()
// //   const editButtonItemId = event.target.getAttribute("data-button");
// //   //TODO Check if this works properly
// //   const theUrl = `/edit/${editButtonItemId}` //TODO Little Changes To Open The Item Page
// //     window.open(theUrl,
// //     "_blank") || window.location.replace(theUrl); });

// // let deleteButton = document.querySelector('#delete-btn');
// // deleteButton.addEventListener('click', (event)=>{
// //   event.preventDefault()
// //   const deleteButtonItemId = event.target.getAttribute("data-button");
// //   //TODO Check if this works properly
// //   const theUrl = `/${deleteButtonItemId}` //TODO Little Changes To Open The Item Page
// //   window.open(theUrl,
// //       "_blank") || window.location.replace(theUrl); });

// // Events
// modalBtn.addEventListener("click", openModal);
// closeBtn.addEventListener("click", closeModal);
// window.addEventListener("click", outsideClick);

// confirmNoBtn.addEventListener("click", closeModal);
// confirmYesBtn.addEventListener("click", openModal2);

// closeBtnInner.addEventListener("click", closeModal2);
// closeBtnInnerFlat.addEventListener("click", closeModal2);

// // Open Main Model
function openDeleteModal(id) {
  const modal = document.querySelector("#delete-modal");
  const confirmBtn = document.querySelector("#confirm-delete-btn");
  if (confirmBtn) {
    confirmBtn.setAttribute("data-id", id);
  }
  if (modal) {
    modal.style.display = "block";
  }
}
function closeDeleteModal() {
  const modal = document.querySelector("#delete-modal");
  if (modal) {
    modal.style.display = "none";
  }
}
function openSuccessModal() {
  const successModal = document.querySelector("#success_tic");
  successModal.style.display = "block";
}
function closeSuccessModal() {
  const successModal = document.querySelector("#success_tic");
  successModal.style.display = "none";
}

// // Open Model 2s (It will close Main Modal and Open Modal 2)
// function openModal2() {
//   innerModal.style.display = "block";
//   modal.style.display = "none";
// }

// // Close Main Modal

// // Close Modal 2 (which will close innerModal)
// function closeModal2() {
//   innerModal.style.display = "none";
// }

// // Close If Outside Click
// function outsideClick(e) {
//   if (e.target == modal) {
//     modal.style.display = "none";
//   }
// }

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    //#region confirm btn
    let confirmBtn = document.getElementById("confirm-delete-btn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        const theItemId = event.target.getAttribute("data-id");

        fetch(`/items/${theItemId}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res.success) {
              // TODO show success tic here
              closeDeleteModal();
              openSuccessModal();
              setTimeout(() => {
                closeSuccessModal();
                location.href = "/items/my-listing";
              }, 1500);
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
    let deleteButtons = document.getElementsByClassName("delete-btn");
    if (deleteButtons) {
      Array.from(deleteButtons).forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          event.stopImmediatePropagation();
          const theItemId = event.target.getAttribute("data-id");
          openDeleteModal(theItemId);
        });
      });
    }

    //#endregion
  });
})();

// Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
//   return arg1 == arg2 ? options.fn(this) : options.inverse(this);
// });

// Handlebars.registerHelper("ifCond", function (v1, v2, options) {
//   if (v1 === v2) {
//     return options.fn(this);
//   }
//   return options.inverse(this);
// });

// Handlebars.registerHelper("ifNot", function (v1, v2, options) {
//   if (v1 !== v2) {
//     return options.fn(this);
//   }
//   return options.inverse(this);
// });
