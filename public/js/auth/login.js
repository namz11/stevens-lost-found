import { helpers, validations, authHelpers } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const loginForm = document.getElementById("login");
    let emailE = document.getElementById("email");
    let passwordE = document.getElementById("pass");

    if (loginForm) {
      //setup event listeners for form

      // event listener - submit button
      loginForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        const form = event.target.elements;

        let emailEnteredByUser = emailE.value;
        let passwordEnteredByUser = passwordE.value;
        try {
          console.log(emailEnteredByUser);
          emailEnteredByUser = authHelpers.checkEmail(emailEnteredByUser);
          passwordEnteredByUser = authHelpers.checkPassword(
            passwordEnteredByUser
          );
        } catch (e) {
          console.log(emailEnteredByUser.value);
          document
            .getElementById("email")
            .setAttribute("value", emailEnteredByUser);
          document
            .getElementById("pass")
            .setAttribute("value", passwordEnteredByUser);
          return alert(e.message || "Something went wrong.");
        }

        fetch("/auth/login", {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form?.email?.value,
            password: form?.password?.value,
          }),
        })
          .then((resp) => {
            if (resp.status === 401) {
              // TODO display error
              alert("wrong username or password");
              return null;
            } else {
              return resp.json();
            }
          })
          .then((res) => {
            if (res) {
              if (res?.success) {
                sessionStorage.setItem("user", JSON.stringify(res.data));
                location.href = "/";
              } else {
                // TODO display error if res.message is there else show alert
                alert(res.message || "Something went wrong.");
              }
            }
          })
          .catch((error) => {
            alert(error.message || "Something went wrong.");
          });
      });
    }
  });
})();
