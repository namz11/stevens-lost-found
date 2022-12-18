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
