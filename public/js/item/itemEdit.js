import { validations } from "/public/js/helpers.js";
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded

    const editItemForm = document.getElementById("editItemForm");
    const editSecondaryItemForm = document.getElementById(
      "editSecondaryItemForm"
    );

    if (editItemForm) {
      //setup event listeners for form

      // event listener - submit button
      editItemForm.addEventListener("submit", (event) => {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        const errorContainer = document.getElementById("editItemErrors");
        errorContainer.innerHTML = "";
        errorContainer.classList.add("hide");
        let errors = [];
        const form = event.target.elements;

        if (!validations.isNameValid(form?.name?.value)) {
          errors.push("Name field needs to have valid value");
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
          formData.append("description", form?.description?.value);
          formData.append("dateLostOrFound", form?.dateLostOrFound?.value);
          formData.append(
            "lostOrFoundLocation",
            form?.lostOrFoundLocation?.value
          );
          formData.append("picture", form?.picture?.files[0]);
          const user = JSON.parse(sessionStorage.getItem("user"));
          const headers = new Headers();
          headers.append("X-User-Id", user._id);
          const itemId = location.pathname.split("/").pop();
          fetch(`/items/edit/${itemId}`, {
            method: "PUT",
            body: formData,
            headers,
          })
            .then((resp) => resp.json())
            .then((res) => {
              if (res.success) {
                alert(res.message || "Item updated!");
                editItemForm.reset();
                const id = location.pathname.split("/").pop();
                location.href = `/items/${id}`;
              } else {
                alert(res.message || "Something went wrong.");
              }
            })
            .catch((error) => {
              alert(error.message || "Something went wrong.");
            });
        }
      });

      // event listener - picture input
      const pictureInput = document.querySelector("#itemPicture");
      const picPath = pictureInput.defaultValue;
      if (picPath) {
        document.querySelector(
          "#itemDisplayPicture"
        ).src = `http://localhost:3000/${picPath}`;
        document.querySelector("#itemDisplayPicture").alt = `${picPath}`;
      }

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
            ).src = `${uploaded_image}`;
            document.querySelector(
              "#itemDisplayPicture"
            ).alt = `this contains the image uploaded by user currently`;
          });
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  });
})();
