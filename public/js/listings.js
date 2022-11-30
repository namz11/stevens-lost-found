// TODO FOR MODALS

// Get DOM Elements
const modal = document.querySelector("#claim-modal");
const modalBtn = document.querySelector("#modal-btn");
const closeBtn = document.querySelector(".close");
const modal2 = document.querySelector("#claim-modal-inner");
const confirmNoBtn = document.querySelector("#confirm-no-btn");
const confirmYesBtn = document.querySelector("#confirm-yes-btn");
const closeBtn2 = document.querySelector("#close-btn2");
const closeBtn2flat = document.querySelector("#close-btn2-flat");

const modalBtn2 = document.querySelector("#modal-btn2");
const modal3 = document.querySelector("#found-modal");
const confirmNoBtn2 = document.querySelector("#confirm-no-btn-2");
const confirmYesBtn2 = document.querySelector("#confirm-yes-btn-2");
const closeBtn3 = document.querySelector("#close2");
const closeBtn3flat = document.querySelector("#close-btn3-flat");
const modal4 = document.querySelector("#found-modal-inner");
const closeBtn4 = document.querySelector("#close-btn4");
const closeBtn4flat = document.querySelector("#close-btn4-flat");

//TODO: Find Some Way to Activate The Next Modal only if both are triggered

// Events
modalBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);

confirmNoBtn.addEventListener("click", closeModal);
confirmYesBtn.addEventListener("click", openModal2);

closeBtn2.addEventListener("click", closeModal2);
closeBtn2flat.addEventListener("click", closeModal2);

modalBtn2.addEventListener("click", openModal3);
closeBtn3.addEventListener("click", closeModal3);
window.addEventListener("click", outsideClick);

confirmNoBtn2.addEventListener("click", closeModal3);
confirmYesBtn2.addEventListener("click", openModal4);
closeBtn4.addEventListener("click", closeModal4);
closeBtn4flat.addEventListener("click", closeModal4);

// Open Main Model
function openModal() {
  modal.style.display = "block";
}

// Open Model 2s (It will close Main Modal and Open Modal 2)
function openModal2() {
  modal2.style.display = "block";
  modal.style.display = "none";
}

// Open Model 3
function openModal3() {
  modal3.style.display = "block";
}

// Open Model 4 (It will close Modal 3 and Open Modal 4)
function openModal4() {
  modal4.style.display = "block";
  modal3.style.display = "none";
}

// Close Main Modal
function closeModal() {
  modal.style.display = "none";
}

// Close Modal 2 (which will close modal2)
function closeModal2() {
  modal2.style.display = "none";
}

// Close Modal 3 (which will close modal3)
function closeModal3() {
  modal3.style.display = "none";
}

// Close Modal 4 (which will close modal4)
function closeModal4() {
  modal4.style.display = "none";
}

// Close If Outside Click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = "none";
  }
}
