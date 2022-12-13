import { validations } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const itemForm = document.getElementById("itemForm");
    const secondaryItemForm = document.getElementById("secondaryItemForm");

    if (itemForm) {
      //setup event listeners for form

      // event listener - submit button
      itemForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        const errorContainer = document.getElementById("createItemErrors");
        errorContainer.innerHTML = "";
        errorContainer.classList.add("hide");
        let errors = [];
        const form = event.target.elements;

        if (!validations.isNameValid(form?.name?.value)) {
          errors.push("Name field needs to have valid value");
        }
        let type = validations.isTypeValid(form?.type?.value);
        if (!type) {
          errors.push("Type field needs to have valid value");
        }
        if (!validations.isDateValid(form?.dateLostOrFound?.value)) {
          errors.push("Date field needs to have valid value");
        }
        if (!validations.isLocationValid(form?.lostOrFoundLocation?.value)) {
          errors.push("Location field needs to have valid value");
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
          const formData = new FormData();
          formData.append("name", form?.name?.value);
          formData.append("type", type);
          formData.append("dateLostOrFound", form?.dateLostOrFound?.value);
          formData.append(
            "lostOrFoundLocation",
            form?.lostOrFoundLocation?.value
          );
          formData.append("picture", form?.picture?.files[0]);
          const user = JSON.parse(sessionStorage.getItem("user"));
          const headers = new Headers();
          headers.append("X-User-Id", user._id);
          fetch("/items/add", {
            method: "POST",
            body: formData,
            headers,
          })
            .then((resp) => resp.json())
            .then((res) => {
              if (res.success) {
                alert(res.message || "Item created!");
                itemForm.reset();
                document.querySelector(
                  "#itemDisplayPicture"
                ).style.backgroundImage = "";
                secondaryItemForm.classList.add("hide");
              } else {
                alert(res.message || "Something went wrong.");
              }
            })
            .catch((error) => {
              alert(error.message || "Something went wrong.");
            });
        }
      });

      // event listener - radio buttons
      const typeRadioBtn = itemForm.type;
      if (typeRadioBtn) {
        for (let i = 0; i < typeRadioBtn.length; i++) {
          typeRadioBtn[i].addEventListener("change", function () {
            secondaryItemForm.classList.remove("hide");
            const dateElement = document.querySelector(
              'label[for="itemDateLostOrFound"]'
            );
            const locElement = document.querySelector(
              'label[for="itemLostOrFoundLocation"]'
            );
            const dateInput = document.getElementById("itemDateLostOrFound");
            const locInput = document.getElementById("itemLostOrFoundLocation");
            dateElement.innerHTML = "";
            locElement.innerHTML = "";
            if (this.value === "lost") {
              dateElement.innerHTML =
                "When did you lose the item?" + dateInput.outerHTML;
              locElement.innerHTML =
                "Where did you lose the item?" + locInput.outerHTML;
            } else {
              dateElement.innerHTML =
                "When did you find the item?" + dateInput.outerHTML;
              locElement.innerHTML =
                "Where did you find the item?" + locInput.outerHTML;
            }
          });
        }
      }

      // event listener - picture input
      const pictureInput = document.querySelector("#itemPicture");
      pictureInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          let { size, type } = this.files[0];
          if (size > 1024 * 1024 * 5) {
            this.value = "";
            alert("File Size is too large. Allowed file size is 5MB");
            return;
          }
          if (
            type !== "image/jpeg" &&
            type !== "image/png" &&
            type !== "image/jpg"
          ) {
            this.value = "";
            alert("Invalid file type. Only jpg/jpeg & png files supported.");
            return;
          }

          const reader = new FileReader();
          reader.addEventListener("load", () => {
            const uploaded_image = reader.result;
            document.querySelector(
              "#itemDisplayPicture"
            ).style.backgroundImage = `url(${uploaded_image})`;
          });
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  });
})();
