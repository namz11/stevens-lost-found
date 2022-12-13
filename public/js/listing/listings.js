// const mongoCollections = require("./config/mongoCollections");
// const Group50_Project_CS546 = mongoCollections.itemsCollection;

// const data = await Group50_Project_CS546();
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

// function getPageList(totalPages, page, maxLength) {
//   function range(start, end) {
//     return Array.from(Array(end - start + 1), (_, i) => i + start);
//   }
//   var sideWidth = maxLength < 9 ? 1 : 2;
//   var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
//   var rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

//   if (totalPages <= maxLength) {
//     return range(1, totalPages);
//   }
//   if (page <= maxLength - sideWidth - 1 - rightWidth) {
//     return range(1, maxLength - sideWidth - 1).concat(
//       0,
//       range(totalPages - sideWidth + 1, totalPages)
//     );
//   }

//   if (page >= totalPages - sideWidth - 1 - rightWidth) {
//     return range(1, sideWidth).concat(
//       0,
//       range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
//     );
//   }
//   return range(1, sideWidth).concat(
//     0,
//     range(page - leftWidth, page + rightWidth),
//     0,
//     range(totalPages - sideWidth + 1, totalPages)
//   );
// }

// let sortItem1 = "";
// let sortItem2 = "";

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

// document.getElementsByName("option1").forEach((radio) => {
//   if (radio.checked) {
//     if (radio.value == "createdAt") {
//       sortItem1 = "createdAt";
//     }
//     if (radio.value == "dateLostOrFound") {
//       sortItem1 = "dateLostOrFound";
//     }
//   }
// });

// document.getElementsByName("option2").forEach((radio) => {
//   if (radio.checked) {
//     if (radio.value == "createdAt") {
//       sortItem2 = "createdAt";
//     }
//     if (radio.value == "dateLostOrFound") {
//       sortItem2 = "dateLostOrFound";
//     }
//   }
// });

function previousfunc1() {
  let page1 = parseInt(document.getElementsById(page1));
  document.getElementsByClassName(page1).innerHTML = page1 - 1;
}
function previousfunc2() {
  let page2 = parseInt(document.getElementsById(page2));
  document.getElementsByClassName(page2).innerHTML = page2 - 1;
}
function nextfunc1() {
  let page1 = parseInt(document.getElementsById(page1));
  document.getElementsByClassName(page1).innerHTML = page1 + 1;
}
function nextfunc2() {
  let page2 = parseInt(document.getElementsById(page2));
  document.getElementsByClassName(page2).innerHTML = page2 + 1;
}

// //getting Data
// const fetchingLostData = async () => {
//   const data = await Group50_Project_CS546();
//   let Data1 = [];
//   for (let i = 0; i < data.length; i++) {
//     if (data[i].isClaimed == false) {
//       if (data[i].type == "lost" || data[i].type == "Lost") {
//         Data1.push(data[i]);
//       }
//     }
//   }

//   $(function () {
//     var numberOfItems1 = Data1.length;
//     var limitPerPage1 = 5;
//     var totalPages1 = Math.ceil(numberOfItems1 / limitPerPage1);
//     var paginationSize1 = 5;
//     var currentPage1;

//     function showPage(whichPage1) {
//       if (whichPage1 < 1 || whichPage1 > totalPages1) return false;

//       currentPage1 = whichPage1;

//       $(".pagination1 li").slice(1, -1).remove();

//       getPageList(totalPages1, currentPage1, paginationSize1).forEach(
//         (item) => {
//           $("<li>")
//             .addClass("page-item")
//             .addClass(item ? "current-page" : "dots")
//             .toggleClass("active", item === currentPage1)
//             .append(
//               $("<a>")
//                 .addClass("page-link")
//                 .attr({ href: "javascript.void(0)" })
//                 .text(item || "...")
//             )
//             .insertBefore(".next-page");
//         }
//       );
//       $(".previous-page").toggleClass("disable", currentPage1 === 1);
//       $(".next-page").toggleClass("disable", currentPage1 === totalPages1);
//       return true;
//     }

//     $(".pagination1").append(
//       $("<li>")
//         .addClass("page-item")
//         .addClass("previous-page")
//         .append(
//           $("<a>")
//             .addClass("page-link")
//             .attr({ href: "javascript:void(0)" })
//             .text("Prev")
//         ),
//       $("<li>")
//         .addClass("page-item")
//         .addClass("next-page")
//         .append(
//           $("<a>")
//             .addClass("page-link")
//             .attr({ href: "javascript:void(0)" })
//             .text("Next")
//         )
//     );
//     $(".card-content").show();
//     showPage(1);

//     $(document).on(
//       "click",
//       "pagination1 li.current-page:not(.active)",
//       function () {
//         return showPage(+$(this).text());
//       }
//     );
//     $(".previous-page").on("click", function () {
//       return showPage(currentPage1 - 1);
//     });
//     $(".next-page").on("click", function () {
//       return showPage(currentPage1 + 1);
//     });
//   });

//   Data1 = Data1.find()
//     .sort({ sortItem1: -1 })
//     .slice((currentPage1 - 1) * limitPerPage1, currentPage1 * limitPerPage1)
//     .exec();

//   return Data1;
// };

// const fetchingFoundData = async () => {
//   const data = await Group50_Project_CS546();
//   let Data2 = [];
//   for (let i = 0; i < data.length; i++) {
//     if (data[i].isClaimed == false) {
//       if (data[i].type == "found" || data[i].type == "Found") {
//         Data2.push(data[i]);
//       }
//     }
//   }
//   $(function () {
//     var numberOfItems2 = Data2.length;
//     var limitPerPage2 = 5;
//     var totalPages2 = Math.ceil(numberOfItems2 / limitPerPage2);
//     var paginationSize2 = 5;
//     var currentPage2;

//     function showPage(whichPage2) {
//       if (whichPage2 < 1 || whichPage2 > totalPages2) return false;

//       currentPage2 = whichPage2;

//       $(".pagination2 li").slice(1, -1).remove();

//       getPageList(totalPages2, currentPage2, paginationSize2).forEach(
//         (item) => {
//           $("<li>")
//             .addClass("page-item")
//             .addClass(item ? "current-page" : "dots")
//             .toggleClass("active", item === currentPage2)
//             .append(
//               $("<a>")
//                 .addClass("page-link")
//                 .attr({ href: "javascript.void(0)" })
//                 .text(item || "...")
//             )
//             .insertBefore(".next-page");
//         }
//       );
//       $(".previous-page").toggleClass("disable", currentPage2 === 1);
//       $(".next-page").toggleClass("disable", currentPage2 === totalPages2);
//       return true;
//     }

//     $(".pagination2").append(
//       $("<li>")
//         .addClass("page-item")
//         .addClass("previous-page")
//         .append(
//           $("<a>")
//             .addClass("page-link")
//             .attr({ href: "javascript:void(0)" })
//             .text("Prev")
//         ),
//       $("<li>")
//         .addClass("page-item")
//         .addClass("next-page")
//         .append(
//           $("<a>")
//             .addClass("page-link")
//             .attr({ href: "javascript:void(0)" })
//             .text("Next")
//         )
//     );
//     $(".card-content").show();
//     showPage(1);

//     $(document).on(
//       "click",
//       "pagination2 li.current-page:not(.active)",
//       function () {
//         return showPage(+$(this).text());
//       }
//     );
//     $(".previous-page").on("click", function () {
//       return showPage(currentPage2 - 1);
//     });
//     $(".next-page").on("click", function () {
//       return showPage(currentPage2 + 1);
//     });
//   });
//   Data2 = Data2.find()
//     .sort({ sortItem2: -1 })
//     .slice((currentPage2 - 1) * limitPerPage2, currentPage2 * limitPerPage2)
//     .exec();

//   return Data2;
// };

// TODO (RUSHABH): Rushabh can try to make some changes on this using similar Class Names and IDs so that it works in a similar fashion to user lisitngs
