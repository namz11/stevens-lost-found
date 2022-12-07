(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const itemForm = document.getElementById("delete");

    if (itemForm) {
      //setup event listeners for form

      // event listener - submit button
      itemForm.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        const itemId = location.pathname.split("/").pop();
        fetch(`/items/${itemId}`, {
          method: "DELETE",
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res.success) {
              alert(res.message || "Item deleted!");
              history.back();
            } else {
              alert(res.message || "Something went wrong.");
            }
          })
          .catch((error) => {
            alert(error.message || "Something went wrong.");
          });
      });
    }
  });
})();
