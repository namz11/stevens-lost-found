const mongoCollections = require("./config/mongoCollections");
const Group50_Project_CS546 = mongoCollections.itemsCollection;

const data = await Group50_Project_CS546();
// TODO FOR MODALS

const { sortBy, create, max } = require("lodash");

// Listing
// Handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
//   return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
// });

// Handlebars.registerHelper("ifCond", function(v1, v2, options) {
//   if(v1 === v2) {
//     return options.fn(this);
//   }
//   return options.inverse(this);
// });

// Handlebars.registerHelper("ifNot", function(v1, v2, options) {
//   if(v1 !== v2) {
//     return options.fn(this);
//   }
//   return options.inverse(this);
// });

function getPageList(totalPages, page, maxLength) {
  function range(start, end) {
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }
  var sideWidth = maxLength < 9 ? 1 : 2;
  var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  var rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

  if (totalPages <= maxLength) {
    return range(1, totalPages);
  }
  if (page <= maxLength - sideWidth - 1 - rightWidth) {
    return range(1, maxLength - sideWidth - 1).concat(
      0,
      range(totalPages - sideWidth + 1, totalPages)
    );
  }

  if (page >= totalPages - sideWidth - 1 - rightWidth) {
    return range(1, sideWidth).concat(
      0,
      range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
    );
  }
  return range(1, sideWidth).concat(
    0,
    range(page - leftWidth, page + rightWidth),
    0,
    range(totalPages - sideWidth + 1, totalPages)
  );
}

let sortItem1 = "";
let sortItem2 = "";

// if (startIndex > 0) {
//   previous = {
//     page: page - 1,
//     limit: limit,
//   };
// }
// if (endIndex < data.countDocuments().exec()) {
//   next = {
//     page: page + 1,
//     limit: limit,
//   };
// }

document.getElementsByName("option1").forEach((radio) => {
  if (radio.checked) {
    if (radio.value == "createdAt") {
      sortItem1 = "createdAt";
    }
    if (radio.value == "dateLostOrFound") {
      sortItem1 = "dateLostOrFound";
    }
  }
});

document.getElementsByName("option2").forEach((radio) => {
  if (radio.checked) {
    if (radio.value == "createdAt") {
      sortItem2 = "createdAt";
    }
    if (radio.value == "dateLostOrFound") {
      sortItem2 = "dateLostOrFound";
    }
  }
});

//getting Data
const fetchingLostData = async () => {
  let Data1 = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].isClaimed == false) {
      if (data[i].type == "lost" || data[i].type == "Lost") {
        Data1.push(data[i]);
      }
    }
  }
  Data1 = Data1.find()
    .sort({ sortItem1: -1 })
    .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage)
    .exec();

  $(function () {
    var numberOfItems1 = Data1.length;
    var limitPerPage1 = 5;
    var totalPages1 = Math.ceil(numberOfItems1 / limitPerPage1);
    var paginationSize1 = 5;
    var currentPage1;

    function showPage(whichPage1) {
      if (whichPage1 < 1 || whichPage1 > totalPages1) return false;

      currentPage1 = whichPage1;

      $(".pagination1 li").slice(1, -1).remove();

      getPageList(totalPages1, currentPage1, paginationSize1).forEach(
        (item) => {
          $("<li>")
            .addClass("page-item")
            .addClass(item ? "current-page" : "dots")
            .toggleClass("active", item === currentPage1)
            .append(
              $("<a>")
                .addClass("page-link")
                .attr({ href: "javascript.void(0)" })
                .text(item || "...")
            )
            .insertBefore(".next-page");
        }
      );
      $(".previous-page").toggleClass("disable", currentPage1 === 1);
      $(".next-page").toggleClass("disable", currentPage1 === totalPages1);
      return true;
    }

    $(".pagination1").append(
      $("<li>")
        .addClass("page-item")
        .addClass("previous-page")
        .append(
          $("<a>")
            .addClass("page-link")
            .attr({ href: "javascript:void(0)" })
            .text("Prev")
        ),
      $("<li>")
        .addClass("page-item")
        .addClass("next-page")
        .append(
          $("<a>")
            .addClass("page-link")
            .attr({ href: "javascript:void(0)" })
            .text("Next")
        )
    );
    $(".card-content").show();
    showPage(1);

    $(document).on(
      "click",
      "pagination1 li.current-page:not(.active)",
      function () {
        return showPage(+$(this).text());
      }
    );
    $(".previous-page").on("click", function () {
      return showPage(currentPage1 - 1);
    });
    $(".next-page").on("click", function () {
      return showPage(currentPage1 + 1);
    });
  });

  return Data1;
};

const fetchingFoundData = async () => {
  let Data2 = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].isClaimed == false) {
      if (data[i].type == "found" || data[i].type == "Found") {
        Data2.push(data[i]);
      }
    }
  }
  Data2 = Data2.find()
    .sort({ sortItem2: -1 })
    .slice((currentPage - 1) * limitPerPage, currentPage * limitPerPage)
    .exec();

  $(function () {
    var numberOfItems2 = Data2.length;
    var limitPerPage2 = 5;
    var totalPages2 = Math.ceil(numberOfItems2 / limitPerPage2);
    var paginationSize2 = 5;
    var currentPage1;

    function showPage(whichPage2) {
      if (whichPage2 < 1 || whichPage2 > totalPages2) return false;

      currentPage2 = whichPage2;

      $(".pagination2 li").slice(1, -1).remove();

      getPageList(totalPages2, currentPage2, paginationSize2).forEach(
        (item) => {
          $("<li>")
            .addClass("page-item")
            .addClass(item ? "current-page" : "dots")
            .toggleClass("active", item === currentPage2)
            .append(
              $("<a>")
                .addClass("page-link")
                .attr({ href: "javascript.void(0)" })
                .text(item || "...")
            )
            .insertBefore(".next-page");
        }
      );
      $(".previous-page").toggleClass("disable", currentPage2 === 1);
      $(".next-page").toggleClass("disable", currentPage2 === totalPages2);
      return true;
    }

    $(".pagination2").append(
      $("<li>")
        .addClass("page-item")
        .addClass("previous-page")
        .append(
          $("<a>")
            .addClass("page-link")
            .attr({ href: "javascript:void(0)" })
            .text("Prev")
        ),
      $("<li>")
        .addClass("page-item")
        .addClass("next-page")
        .append(
          $("<a>")
            .addClass("page-link")
            .attr({ href: "javascript:void(0)" })
            .text("Next")
        )
    );
    $(".card-content").show();
    showPage(1);

    $(document).on(
      "click",
      "pagination2 li.current-page:not(.active)",
      function () {
        return showPage(+$(this).text());
      }
    );
    $(".previous-page").on("click", function () {
      return showPage(currentPage1 - 1);
    });
    $(".next-page").on("click", function () {
      return showPage(currentPage1 + 1);
    });
  });

  return Data2;
};

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

module.exports = { fetchingFoundData, fetchingLostData };
