//		## GLOBALS

var datefrom;
var dateto;
var clonedCount = 0;
var selectionSummary = [];
//		## INIT
(function ($, document, window, undefined) {
  $(document).ready(function () {
    console.log("main.js");
    $(".datepicker").datepicker();
    $("#number-of-guests0").value = "";
    $("#type0").value = "";
    var checkboxes = document.querySelectorAll(
      "input [type=checkbox] [name=extras]"
    );
    console.log(checkboxes);
    let enabledSettings = [];
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        enabledSettings = Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
          .filter((i) => i.checked) // Use Array.filter to remove unchecked checkboxes.
          .map((i) => i.value); // Use Array.map to extract only the checkbox values from the array of objects.

        console.log(enabledSettings);
      });
    });
  });
})(jQuery, document, window);

/* 		## VALIDATIONS
		## 1.) 
			a.) Email Validation (only valid emails);
			b.) Phone Number field allows only digits.
		## 2. Displaying the "From" and "To" dates respectfully.
			a.) Calculating difference between the From and To dates and setting the total Days spent 
				/ex. staying from 1st to 4th = 4 days (although, technically this is a 3-night stay,
					and people should not be paying for check-out-day). Following requirements - counting total DAYS/
			* Added functionallity for date-checking (Cannot enter To date after Before) 
				/ex. From: 10.Jan... to 2.Jan.. => error/
			* Changed date format to match example code
				/ex. 03.22.2019 => 22.03.2019
*/

function validateEmail(mail) {
  if (mail.value) {
    if (
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
        mail.value
      )
    ) {
      mail.style.border = "1px solid green";
      return true;
    }
    {
      mail.style.border = "1px solid red";
      return false;
    }
  }
  mail.style.border = "1px solid #ced4da";
}

function handleEmailClick(mail) {
  mail.style.border = "1px solid #ced4da";
}

function onlyNumbers(str) {
  return /^[0-9]*$/.test(str);
}

function handlePhoneNumberInput(number) {
  if (number.value) {
    //check if fields contains only numbers, and if empty - set border to default value
    onlyNumbers(number.value)
      ? (number.style.border = "1px solid green")
      : (number.style.border = "1px solid red");
  } else number.style.border = "1px solid #ced4da";
}

function getDateDiff() {
  //convert difference in days (received in milliseconds) to days (add +1 because if you checkin at 1/1/2021 and checkout at 1/1/2021, you have stayed at least one day)
  res = (Date.parse(dateto) - Date.parse(datefrom)) / (60 * 60 * 24 * 1000) + 1;
  return Math.round(res);
}

function handleDateChange(el) {
  //check if field has value
  if (el.value) {
    if (el.id == "date-from") {
      datefrom = el.value;
      if (getDateDiff() < 0) {
        alert("Please select a day before " + dateto + ".");
        //selected day is after the to date
        //bad date selected
        console.log("bad date selection");
        datefrom = "";
        console.log("datefrom reset: ", datefrom);
        el.value = "";
        el.focus();
        resetDateInputs();
      }
    } else if (el.id == "date-to") {
      dateto = el.value;
      if (getDateDiff() < 0) {
        //selected day is before the from date
        //bad date selected
        alert("Please select a day after " + datefrom + ".");
        dateto = "";
        console.log("dateto reset: ", dateto);
        el.value = "";
        el.focus();
        resetDateInputs();
      }
    }
  }
  if (datefrom && dateto) {
    //convert to example format (DD-MM-YYYY)
    var newDateFrom = new Date(datefrom).toLocaleDateString("en-UK");
    var newDateTo = new Date(dateto).toLocaleDateString("en-UK");
    //all is correct - display all
    document.getElementById("fromTxt").innerHTML = "From ";
    document.getElementById("fromDate").innerHTML = newDateFrom;
    document.getElementById("toTxt").innerHTML = " to ";
    document.getElementById("toDate").innerHTML = newDateTo;
    document.getElementById("daysTxt").innerHTML =
      " (" + getDateDiff() + " days):";
  } else {
    //something went wrong - remove html values
    resetDateInputs();
  }
}

function resetDateInputs() {
  document.getElementById("fromTxt").innerHTML = "";
  document.getElementById("fromDate").innerHTML = "";
  document.getElementById("toTxt").innerHTML = "";
  document.getElementById("toDate").innerHTML = "";
  document.getElementById("daysTxt").innerHTML = "";
}

//		## SUBMIT (Event listeners) - 1. c.) Making sure rest of the fields contain some value

document.getElementById("form1").addEventListener("submit", (event) => {
  //dont refresh on send
  event.preventDefault();
  //find all fields from the form that has the required attribute
  var x = document.getElementById("form1").querySelectorAll("[required]");
  for (i = 0; i < x.length; i++) {
    //check for empty fields (required field supported by all browsers - popovers' text with "fill out this field")
    !x[i].value
      ? (x[i].style.border = "1px solid red")
      : (x[i].style.border = "1px solid green");
  }
  console.log("Submit");
});

//		## 3.) Displaying the room type, number of guests and total sum of staying days

function handleOptionSelect(e) {
  console.log(e.id, e.value);
  //	maybe not the best way to access the second selection, but if you do not select an option from the same row and just add
  //		another row, there is an error
  let type = e.parentNode.parentNode.children[0].children[1];
  let guests = e.parentNode.parentNode.children[1].children[1];
  let existing = document.getElementById("listItem" + clonedCount);
  //work with current row-summaryData (rowId = listItemId)
  let rowID = e.id.match(/\d+/)[0];
  console.log("rowID: ", rowID);
  if (existing) console.log(existing.children);

  if (isSelectionValid(type, guests)) {
    let listItem = selectionSummary.filter((item) => {
      if (item.selectionId === rowID) return item.selectionId;
    });
    if (listItem.length == 0) {
      console.log("not found in list - adding");
      //id not found - should add it to the list
      selectionSummary.push({
        selectionId: rowID,
        type: type.value,
        guests: guests.value,
        price: calculatePrice(type.value, guests.value),
      });

      //add to DOM
      let details = document.getElementById("summaryDetailsList");
      details.innerHTML = selectionSummary.map((e) => {
        return (
          '<li id="listItem' +
          e.selectionId +
          '">1 x ' +
          e.type +
          " (" +
          e.guests +
          (e.guests > 1
            ? " people) — <strong>$" +
              (e.price ? e.price : "-") +
              "</strong></li>"
            : " person) — <strong>$" +
              (e.price ? e.price : "-") +
              "</strong></li>")
        );
      });
    } else {
      //item not in list - pushing in list
      console.log("ITEM FOUND IN LIST - SHOULD EDIT!!!!!", listItem);
    }
  }
  console.log("selectionSummary: ", selectionSummary);
}

function isSelectionValid(type, guests) {
  //check if both options are selected from the row
  //validate capacity for single and double rooms
  if (type.value && guests.value) {
    if (
      (type.value == "single-room" && guests.value == 1) ||
      (type.value == "double-room" && guests.value <= 3)
    ) {
      console.log("Room capacity - ok");
      guests.style.border = "1px solid green";
      type.style.border = "1px solid green";
      return true;
    } else if (type.value == "apartment" || type.value == "maisonette") {
      //other rooms - up to 5 people
      console.log("Room capacity - ok");
      guests.style.border = "1px solid green";
      type.style.border = "1px solid green";
      return true;
    } else {
      console.log("Room capacity Overload!");
      guests.style.border = "1px solid red";
      return false;
    }
  } else {
    console.log("Error, has at least one empty field!");
    guests.style.border = "1px solid red";
    return false;
  }
}

function calculatePrice(type, guests) {
  let days = getDateDiff();
  if (days > 0) {
    var roomPrice = 0;
    switch (type) {
      case "single-room":
        //$50/person
        roomPrice = guests * 50 * days;

        break;
      case "double-room":
        //$60/person
        roomPrice = guests * 60 * days;
        break;
      case "apartment":
        //$90/person
        roomPrice = guests * 90 * days;
        break;
      case "maisonette":
        //$130/person
        roomPrice = guests * 130 * days;
        break;
      default:
        roomprice += 0;
        break;
    }
    return roomPrice;
  } else
    alert("Please choose valid date in order to calculate the correct price");
}

//		## 5. Integration of the "Add Room" button

function handleAddRoomClick() {
  //make a duplicate of the room row
  var original = document.getElementById("duplicator" + clonedCount);
  var clone = original.cloneNode(true); // "deep" clone
  //modify the id to be unique
  clone.id = "duplicator" + ++clonedCount;
  //append to DOM
  original.parentNode.insertBefore(clone, original.nextElementSibling);
  //modify added row id's (must be unique)
  var currRow = document.getElementById("duplicator" + clonedCount);
  currRow.querySelector("#type" + (clonedCount - 1)).id = "type" + clonedCount;
  currRow.querySelector("#number-of-guests" + (clonedCount - 1)).id =
    "number-of-guests" + clonedCount;
  //reset duplicate data values
  currRow.querySelector("#type" + clonedCount).value = "";
  currRow.querySelector("#number-of-guests" + clonedCount).value = "";
  //force gray border in case original fields have green/red borders -- reset everything
  currRow.querySelector("#type" + clonedCount).style.border =
    "1px solid #ced4da";
  currRow.querySelector("#number-of-guests" + clonedCount).style.border =
    "1px solid #ced4da";
}
