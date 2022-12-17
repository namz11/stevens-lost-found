import { helpers, validations } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const verifyForm = document.getElementById("verifyUserForm");

    if (verifyForm) {
      //setup event listeners for form

      // event listener - submit button
      verifyForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        const errorContainer = document.getElementById("verifyErrors");
        errorContainer.innerHTML = "";
        errorContainer.classList.add("hide");
        let errors = [];
        const form = event.target.elements;

        if (!helpers.isNumberValid(form?.otp?.value)) {
          errors.push("OTP must be a number");
        }
        if (!validations.isOTPValid(form?.otp?.value)) {
          errors.push("OTP must be 4 digits");
        }

        if (errors.length > 0) {
          errorContainer.classList.remove("hide");
          errors.forEach((text) => {
            let errorItem = document.createElement("li");
            errorItem.setAttribute("class", "error-text");
            errorItem.innerHTML = text;
            errorContainer.appendChild(errorItem);
          });
        } else {
          const user = JSON.parse(sessionStorage.getItem("user"));

          fetch("/auth/verify", {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              otp: form?.otp?.value,
              userId: user._id,
            }),
          })
            .then((resp) => resp.json())
            .then((res) => {
              if (res.success) {
                alert(res.message || "User verified");
                sessionStorage.setItem("user", JSON.stringify(res.data));
                location.href = "/items";
              } else {
                alert(res.message || "Something went wrong.");
              }
            })
            .catch((error) => {
              alert(error.message || "Something went wrong.");
            });
        }
      });
    }

    const resendBtn = document.getElementById("btnResendOtp");
    if (resendBtn) {
      resendBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();

        const user = JSON.parse(sessionStorage.getItem("user"));

        fetch("/auth/resend-otp", {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            userId: user._id,
          }),
        })
          .then((resp) => resp.json())
          .then((res) => {
            if (res.success) {
              alert(res.message || "Otp sent");
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
