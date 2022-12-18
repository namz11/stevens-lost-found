(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const claimModalSuggestions = document.querySelector(
      "#claimModalSuggestions"
    );
    const claimModalTextSuggestions = document.querySelector(
      "#claimModalTextSuggestions"
    );
    const claimModalTitleSuggestions = document.querySelector(
      "#claimModalTitleSuggestions"
    );
    const successModalSuggestions = document.querySelector(
      "#successModalSuggestions"
    );
    const confirmBtnSuggestions = document.querySelector(
      "#confirmBtnSuggestions"
    );

    function openClaimModal(id, type) {
      if (confirmBtnSuggestions) {
        confirmBtnSuggestions.setAttribute("data-id", id);
      }
      if (claimModalSuggestions) {
        claimModalSuggestions.style.display = "block";
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
          claimModalTextSuggestions.innerHTML =
            "Are you sure this item is yours and you want to claim it?";
          claimModalTitleSuggestions.innerHTML = "Claim item?";
        } else if (type === "lost") {
          claimModalTextSuggestions.innerHTML =
            "Are you sure you have found this item?";
          claimModalTitleSuggestions.innerHTML = "Found item?";
          claimModalSuggestions.style.display = "block";
        }
      }
    }

    function closeClaimModal() {
      if (confirmBtnSuggestions) {
        confirmBtnSuggestions.setAttribute("data-id", "");
      }
      if (claimModalSuggestions) {
        claimModalSuggestions.style.display = "none";
        claimModalTextSuggestions.innerHTML = "";
        claimModalTitleSuggestions.innerHTML = "";
      }
    }

    if (confirmBtnSuggestions) {
      confirmBtnSuggestions.addEventListener("click", (event) => {
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
              successModalSuggestions.style.display = "block";
              closeClaimModal();

              setTimeout(() => {
                successModalSuggestions.style.display = "none";
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
    let claimButtonsViews = document.getElementsByClassName(
      "claim-button-suggestions"
    );
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
