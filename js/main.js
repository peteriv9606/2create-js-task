//		## GLOBALS

var datefrom;
var dateto;
var clonedCount = 0;

var extras = [];
var detailsSummary = [];
var selectionSummary = [
  {
    selectionId: "",
    type: "",
    guests: 0,
    price: 0,
  },
];

//		## INIT
(function ($, document, window, undefined) {
  $(document).ready(function () {
    console.log("main.js");
    $(".datepicker").datepicker();
    $("#number-of-guests0").value = "";
    $("#type0").value = "";
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

function resetFieldColor(el) {
  //case 1: border is red because of php validation error - field is empty
  if ((el.style.border = "1px solid red")) {
    el.style.border = "1px solid #ced4da";
  }
}

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
    if (onlyNumbers(number.value)) {
      number.style.border = "1px solid green";
    } else number.style.border = "1px solid red";
  } else number.style.border = "1px solid #ced4da";
}

function getDateDiff() {
  //convert difference in days (received in milliseconds) to days (add +1 because if you checkin at 1/1/2021 and checkout at 1/1/2021, you have stayed at least one day)
  res = (Date.parse(dateto) - Date.parse(datefrom)) / (60 * 60 * 24 * 1000) + 1;
  return Math.round(res);
}

function updateDomDates() {
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

  //find all fields from the form that has the required attribute ( This was the first option I used - it's better,
  //but for the purpouse of only JavaScript validation and PHP valdation -
  //I'm changing this as I do not want the balloon prompting the user to "fill out this field" to be shown, and also
  //doing some field input validation as well)

  /*  var x = document.getElementById("form1").querySelectorAll("[required]");
  for (i = 0; i < x.length; i++) {
    //check for empty fields (required field supported by all browsers - popovers' text with "fill out this field")
    !x[i].value
      ? (x[i].style.border = "1px solid red")
      : (x[i].style.border = "1px solid green"); }
  console.log("Submit"); */

  //front-end validation

  let incorrectFields = 0;
  var x = document
    .getElementById("form1")
    .querySelectorAll('abbr[title="required"]');
  x.forEach((field) => {
    let requiredField = field.parentNode.parentNode.childNodes[3];
    if (!requiredField.value) {
      incorrectFields += 1;
      requiredField.style.border = "1px solid red";
    } else {
      // mark and update all correct fields
      requiredField.style.border = "1px solid green";
      //update to detailsSummary list
      switch (requiredField.name) {
        case "title":
          detailsSummary.title = requiredField.value;
          break;
        case "first-name":
          detailsSummary.firstName = requiredField.value;
          break;
        case "last-name":
          detailsSummary.lastName = requiredField.value;
          break;
        case "email":
          detailsSummary.email = requiredField.value;
          break;
        case "phone-number":
          detailsSummary.phoneNumber = requiredField.value;
          break;
        case "address-line1":
          detailsSummary.address = requiredField.value;
          break;
        case "state":
          detailsSummary.state = requiredField.value;
          break;
        case "city":
          detailsSummary.city = requiredField.value;
          break;
        case "postcode":
          detailsSummary.postcode = requiredField.value;
          break;
      }
    }
  });
  var y = document.getElementById("form1").querySelectorAll("[required]");
  y.forEach((field) => {
    if (field.style.border == "1px solid red") {
      console.log("Has some incorrectly inputed data.");
      incorrectFields += 1;
    }
  });
  console.log("Total Incorrect fields:", incorrectFields);
  if (incorrectFields != 0) {
    //form has incorrect fields

    alert("Wrong Input \n//boxes highlighted in red//");
  } else {
    //no empty/wrong fields - collect info & perform submit
    //the example below is working, but I cannot implement it to collect and send all the data to be validated.... sorry
    let data = [detailsSummary, selectionSummary, extras];
    console.log("COMBINED: ", data);
    /*       $.ajax({
      url: "form_validation.php", //the page containing php script
      type: "post", //request type,
      dataType: "json",
      data: { status: "success", name: "xyz", email: "abc@gmail.com" },
      success: function (result) {
        alert(result.abc + "\nData collected: \n", result.second);
      },
    });    */
  }
});

//		## 3.) Displaying the room type, number of guests and total sum of staying days

function handleChange(e) {
  let str = e.id.replace(/[0-9]/g, "");
  let rowID;
  if (str != "date-from" && str != "date-to") {
    rowID = e.id.match(/\d+/)[0];
  }

  switch (e.id) {
    case "date-from":
      datefrom = e.value;
      if (getDateDiff() < 0) {
        alert("Please select a day before " + dateto + ".");
        //selected day is after the to date
        //bad date selected
        console.log("bad date selection");
        datefrom = "";
        console.log("datefrom reset: ", datefrom);
        e.value = "";
        e.focus();
        resetDateInputs();
      } else {
        console.log("datefrom: ", datefrom);
        updateDomDates();
      }
      break;
    case "date-to":
      dateto = e.value;
      if (getDateDiff() < 0) {
        //selected day is before the from date
        //bad date selected
        alert("Please select a day after " + datefrom + ".");
        dateto = "";
        console.log("dateto reset: ", dateto);
        e.value = "";
        e.focus();
        resetDateInputs();
      } else {
        console.log("dateto: ", dateto);
        updateDomDates();
      }
      break;
  }
  switch (str) {
    case "type":
      //check if existing - if true - perform update on element
      //if not - check if first element - if true - perform update on first element
      //if not - element is new - push to sectionSummary
      var firstEl = selectionSummary.filter((item) => item.selectionId == "");
      var existingEl = selectionSummary.filter(
        (item) => item.selectionId == rowID
      );

      if (firstEl.length) {
        //first element
        getGuestCapacity(e.value);
        firstEl[0].selectionId = rowID;
        firstEl[0].type = e.value;
        selectionSummary[0] = firstEl[0];
      } else if (existingEl.length) {
        //existing element
        existingEl[0].type = e.value;
      } else {
        //new item
        getGuestCapacity(e.value);
        selectionSummary.push({
          selectionId: rowID,
          type: e.value,
          guests: 0,
          price: 0,
        });
      }
      break;
    case "number-of-guests":
      //check capacity

      var firstEl = selectionSummary.filter((item) => item.selectionId == "");
      var existingEl = selectionSummary.filter(
        (item) => item.selectionId == rowID
      );

      if (firstEl.length) {
        //first element
        getAvailableRooms(e.value);
        firstEl[0].selectionId = rowID;
        firstEl[0].guests = e.value;
        selectionSummary[0] = firstEl[0];
      } else if (existingEl.length) {
        //existing element

        existingEl[0].guests = e.value;
      } else {
        //new item
        getAvailableRooms(e.value);
        selectionSummary.push({
          selectionId: rowID,
          type: "",
          guests: e.value,
          price: 0,
        });
      }

      break;
  }

  console.log("SelectionSummary list status: ", selectionSummary);
  checkFields();
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
  } else if (!type.value && !guests.value) {
    console.log("Record removed from data");
    guests.style.border = "1px solid green";
    type.style.border = "1px solid green";
  } else {
    console.log("Error, has at least one empty field!");
    console.log("Type.value = ", type.value, " guests.value = ", guests.value);
    if (type.value) {
      guests.style.border = "1px solid red";
    } else type.style.border = "1px solid red";
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
        roomPrice += 0;
        break;
    }
    return roomPrice;
  } else
    alert("Please choose valid date in order to calculate the correct price");
}

function getAvailableRooms(e) {
  switch (e) {
    case "1":
      alert("Valid Room types for (1) person - All");
      break;
    case "2":
      alert("Valid Room types for (2) people - All but Single Room");
      break;
    case "3":
      alert(
        "Valid Room types for (3) people - Double Room, Apartament and Maisonette"
      );
      break;
    case "4":
    case "5":
      alert(
        "Valid Room types for (" + e + ") people - Apartament and Maisonette"
      );
      break;

    default:
      alert("Please select a valid Guest Number option.");
      break;
  }
}

function getGuestCapacity(e) {
  switch (e) {
    case "single-room":
      alert("(" + e + ") capacity: 1 person");
      break;
    case "double-room":
      alert("(" + e + ") capacity: up to 3 people");
      break;
    case "apartment":
      alert("(" + e + ") capacity: up to 5 people");
      break;
    case "maisonette":
      alert("(" + e + ") capacity: up to 5 people");
      break;

    default:
      alert("Please select a valid Room Type option.");
      break;
  }
}

function checkFields() {
  //checking all respectable fields in DOM

  let parent = document.getElementById("roomParentComponent");
  children = parent.querySelectorAll("[id^='duplicator']");
  children.forEach((row) => {
    let type = row.children[0].children[1];
    let guests = row.children[1].children[1];
    let rowID = type.id.match(/\d+/)[0];
    if (isSelectionValid(type, guests)) {
      if (type.value && guests.value && getDateDiff() > 0) {
        //if both exist - calclulate price and update price in list and summary in DOM
        let item = selectionSummary.filter((item) => item.selectionId == rowID);
        item[0].price = calculatePrice(type.value, guests.value);

        selectionSummary.map((el) => {
          if (el.selectionId == item[0].selectionId) {
            el.price = item[0].price;
          }
        });
      } else {
        //wrong input - reset price
        selectionSummary.map((item) => {
          if (item.selectionId == rowID) {
            item.price = 0;
          }
        });
      }
    }
  });
  domUmpdate();
}

function domUmpdate() {
  let detailsElement = document.getElementById("summaryDetailsList");
  detailsElement.innerHTML = "";
  let tsaElement = document.getElementById("totalSummaryAmount");
  let tsamount = 0;
  selectionSummary.map((item) => {
    if (item.selectionId && item.type && item.guests && item.price != 0) {
      tsamount += item.price;

      detailsElement.innerHTML +=
        '<li id="listItem' +
        item.selectionId +
        '">1 x ' +
        item.type +
        ` (` +
        item.guests +
        (item.guests > 1
          ? ` people) — <strong>$` +
            (item.price ? item.price : `-`) +
            `</strong></li>`
          : ` person) — <strong>$` +
            (item.price ? item.price : `-`) +
            `</strong></li>`);

      tsaElement.innerHTML = tsamount
        ? "Total Amount: <strong>$" +
          (tsamount + getCheckboxesState()) +
          "</strong>"
        : null;
    }
  });
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

function getCheckboxesState() {
  children = document.getElementsByName("extras[]");
  eList = document.getElementById("extrasList");

  eList.innerHTML = "";
  extras = [];

  var total = 0;
  children.forEach((state) => {
    if (state.checked == true) {
      switch (state.value) {
        case "parking-spot":
          // + $30/day
          total += 30;

          break;
        case "car-rent":
          // + $50/day
          total += 50;

          break;
        case "travel-guide":
          // + $50/day
          total += 50;

          break;
        default:
          total = 0;

          break;
      }
      extras.push(state.value);
    }
  });

  eList.innerHTML = extras
    .map((item) => {
      return (
        `<li> ` +
        item +
        ` — <strong>$` +
        (item == "parking-spot" ? 30 * getDateDiff() : 50 * getDateDiff()) +
        `</strong></li>`
      );
    })
    .join("");

  if (getDateDiff()) {
    total = total * getDateDiff();
  }
  return total;
}
