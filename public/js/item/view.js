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
  const successModal = document.querySelector("#viewSuccessModal");
  successModal.style.display = "block";
}
function closeSuccessModal() {
  const successModal = document.querySelector("#viewSuccessModal");
  successModal.style.display = "none";
}

(function () {
  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const claimModalViews = document.querySelector("#claimModalViews");
    const claimModalTextViews = document.querySelector("#claimModalTextViews");
    const claimModalTitleViews = document.querySelector(
      "#claimModalTitleViews"
    );
    const successModalViews = document.querySelector("#successModalViews");
    const confirmBtnViews = document.querySelector("#confirmBtnViews");

    function openClaimModal(id, type) {
      if (confirmBtnViews) {
        confirmBtnViews.setAttribute("data-id", id);
      }
      if (claimModalViews) {
        claimModalViews.style.display = "block";
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
          claimModalTextViews.innerHTML =
            "Are you sure this item is yours and you want to claim it?";
          claimModalTitleViews.innerHTML = "Claim item?";
        } else if (type === "lost") {
          claimModalTextViews.innerHTML =
            "Are you sure you have found this item?";
          claimModalTitleViews.innerHTML = "Found item?";
          claimModalViews.style.display = "block";
        }
      }
    }

    function closeClaimModal() {
      if (confirmBtnViews) {
        confirmBtnViews.setAttribute("data-id", "");
      }
      if (claimModalViews) {
        claimModalViews.style.display = "none";
        claimModalTextViews.innerHTML = "";
        claimModalTitleViews.innerHTML = "";
      }
    }

    if (confirmBtnViews) {
      confirmBtnViews.addEventListener("click", (event) => {
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
              successModalViews.style.display = "block";
              closeClaimModal();

              setTimeout(() => {
                successModalViews.style.display = "none";
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
    let claimButtonsViews =
      document.getElementsByClassName("claim-button-views");
    if (claimButtonsViews) {
      Array.from(claimButtonsViews).forEach((btn) => {
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
