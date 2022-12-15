import { authHelpers } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    if (forgotPasswordForm) {
      //setup event listeners for form

      // event listener - submit button
      forgotPasswordForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        const form = event.target.elements;

        let emailEntered = document.getElementById("email");

        try {
          emailEntered = authHelpers.checkEmail(emailEntered.value);
        } catch (e) {
          document
            .getElementById("email")
            .setAttribute("value", emailEntered.value);
          return alert(e.message || "Something went wrong.");
        }

        fetch("/auth/forgot-password", {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailEntered,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json();
            }
          })
          .then((data) => {
            if (data) {
              if (data.success == false) {
                document
                  .getElementById("email")
                  .setAttribute("value", data.email || "");

                return alert(data.message || "Something went wrong.");
              }
            }
            location.href = "/auth/login";
            return;
          })
          .catch((error) => {
            alert(error.message || "Something went wrong.");
          });
      });
    }
  });
})();
