(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const navLogout = document.getElementById("navLogout");

    if (navLogout) {
      //setup event listeners for form

      // event listener - submit button
      navLogout.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        fetch(`/auth/logout`, {
          method: "DELETE",
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res.logout) {
              localStorage.clear();
              location.href = `/auth/login`;
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
