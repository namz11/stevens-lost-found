import { authHelpers } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const registerForm = document.getElementById("register");

    if (registerForm) {
      //setup event listeners for form

      // event listener - submit button
      registerForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
        const form = event.target.elements;

        let firstNameEntered = document.getElementById("FN");
        let lastNameEntered = document.getElementById("LN");
        let emailEntered = document.getElementById("email");
        let dobEntered = document.getElementById("dob");
        let phoneNumberEntered = document.getElementById("phn");
        let passwordEntered = document.getElementById("pass");

        try {
          console.log(firstNameEntered);
          firstNameEntered = authHelpers.checkName(
            firstNameEntered.value,
            "First Name"
          );
          lastNameEntered = authHelpers.checkName(
            lastNameEntered.value,
            "Last Name"
          );
          emailEntered = authHelpers.checkEmail(emailEntered.value);
          dobEntered = authHelpers.checkDOB(dobEntered.value);
          phoneNumberEntered = authHelpers.checkPhoneNumber(
            phoneNumberEntered.value
          );
          passwordEntered = authHelpers.checkPassword(passwordEntered.value);
        } catch (e) {
          document
            .getElementById("FN")
            .setAttribute("value", firstNameEntered.value);
          document
            .getElementById("LN")
            .setAttribute("value", lastNameEntered.value);
          document
            .getElementById("email")
            .setAttribute("value", emailEntered.value);
          document
            .getElementById("dob")
            .setAttribute("value", dobEntered.value);
          document
            .getElementById("phn")
            .setAttribute("value", phoneNumberEntered.value);
          document
            .getElementById("pass")
            .setAttribute("value", passwordEntered.value);
          return alert(e.message || "Something went wrong.");
        }

        fetch("/auth/register", {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstNameEntered,
            lastName: lastNameEntered,
            email: emailEntered,
            dateOfBirth: dobEntered,
            phoneNumber: phoneNumberEntered,
            password: passwordEntered,
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
                  .getElementById("FN")
                  .setAttribute("value", data.firstName);
                document
                  .getElementById("LN")
                  .setAttribute("value", data.lastName);
                document
                  .getElementById("email")
                  .setAttribute("value", data.email);
                document
                  .getElementById("dob")
                  .setAttribute("value", data.dateOfBirth);
                document
                  .getElementById("phn")
                  .setAttribute("value", data.phoneNumber);
                document
                  .getElementById("pass")
                  .setAttribute("value", data.password);

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
