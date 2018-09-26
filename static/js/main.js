var NUM_REQS = 0;           // Number of requests that have yet to come back
var DAY_OFFSET = 0;     // Offset from current day (day user wants to view room availability for)
var MONTHS = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
var FULL_DAY_VIEW = false;


// Adds a zero to the start of an integer if it is below 10 & turns the integer into a string
function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/*
  Sets rows of the table to be displayed or not depending on whether the
  user wants to see the full day or just the upcoming hours.

  Then makes requests for the availability of each room for the day.
*/
function setUpTable(){
    var today = new Date();
    for(var hour=0;hour<24;hour++){
      row = document.getElementById("hour-"+hour);
      if(FULL_DAY_VIEW){
        row.classList.remove("d-none");
      }
      else if(hour<today.getHours() || hour>=today.getHours()+8){
        row.classList.add("d-none");
      }
    }
    getRooms();
}

//Makes requests for each room's data and updates the table accordingly
function getRooms(){
    for(var room=1;room<10;room++){
      addRoom(room);
    }
}

// Makes a request for a room and updates its availability in the table
function addRoom(room){
  var xmlhttp;
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          updateRoomAvailability(room, true, xmlhttp.responseText);
          NUM_REQS--;
      }
  }
  if(window.location.href.includes('secret')){
    xmlhttp.open("GET", "?n="+room+"&o="+DAY_OFFSET+"&secret=1738", true);
  }
  else{
    xmlhttp.open("GET", "?n="+room+"&o="+DAY_OFFSET, true);
  }
  xmlhttp.send();
  NUM_REQS++;
}

// Adds a room's availability to the table
function updateRoomAvailability(room,current,response){

    bookings = JSON.parse(response);

    // Get todays' date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    // Add td to the row for that room
    for(var i=0;i<24;i++){

      hour = i;

      row = document.getElementById("hour-"+i);
      var td = document.createElement("td");

      if(hour>0 && bookings[hour-1]!=null && bookings[hour-1].length==2){


        // If the booking is at the top of the table, make it look as if the room is booked for one hour
        if(!FULL_DAY_VIEW && hour==today.getHours()){

            // Create booked div for medium size up screens
            var mdDiv = document.createElement("div");
            mdDiv.classList.add("d-none");
            mdDiv.classList.add("d-md-block");
            mdDiv.classList.add("text-light");
            var mdI = document.createElement("i");
            mdI.classList.add("fa");
            mdI.classList.add("fa-bookmark");
            var text = bookings[hour-1].name==null ? document.createTextNode(" Booked") : document.createTextNode(" "+bookings[hour-1].name);
            mdDiv.appendChild(mdI);
            mdDiv.appendChild(text);

            // Create div for small to medium sized screens
            var smDiv = document.createElement("div");
            smDiv.classList.add("d-block");
            smDiv.classList.add("d-md-none");
            smDiv.classList.add("text-light");
            var smI = document.createElement("i");
            smI.classList.add("fa");
            smI.classList.add("fa-bookmark");
            smDiv.appendChild(smI);

            // Add td to row for this hour
            td.setAttribute("style", "background-color: #343A40;");
            td.appendChild(mdDiv);
            td.appendChild(smDiv);
            td.setAttribute("id","room-"+room+"-hour-"+hour);

            var oldTd = document.getElementById("room-"+room+"-hour-"+hour);
            row.replaceChild(td,oldTd);

        }
        // If the booking above is for two hours, remove this hour's td from the table
        else{
          var oldTd = document.getElementById("room-"+room+"-hour-"+hour);
          oldTd.classList.add("d-none");
        }

      }
      else if(bookings[hour]==null){

        // Create div for medium size up screens
        var mdDiv = document.createElement("div");
        mdDiv.classList.add("d-none");
        mdDiv.classList.add("d-md-block");
        var mdA = document.createElement("a");
        mdA.setAttribute("target","_blank");
        mdA.setAttribute("title","Book Room "+room);
        mdA.setAttribute("onclick","book_room("+room+", "+hour+");");
        mdA.setAttribute("style","color:#007bff;");
        mdA.innerHTML = "Available";
        mdDiv.appendChild(mdA);

        // Create div for small to medium sized screens
        var smDiv = document.createElement("div");
        smDiv.classList.add("d-block");
        smDiv.classList.add("d-md-none");
        var smA = document.createElement("a");
        smA.setAttribute("style","color:#007bff;");
        smA.setAttribute("target","_blank");
        smA.setAttribute("onclick","book_room("+room+", "+hour+");");
        var smI = document.createElement("i");
        smI.classList.add("fa");
        smI.classList.add("fa-ticket");
        smA.appendChild(smI);
        smDiv.appendChild(smA);

        // Add td to row for this hour
        td.appendChild(mdDiv);
        td.appendChild(smDiv);
        td.setAttribute("id","room-"+room+"-hour-"+hour);
        var oldTd = document.getElementById("room-"+room+"-hour-"+hour);
        row.replaceChild(td,oldTd);
      }
      else{

          // Create booked div for medium size up screens
          var mdDiv = document.createElement("div");
          mdDiv.classList.add("d-none");
          mdDiv.classList.add("d-md-block");
          mdDiv.classList.add("text-light");
          var mdI = document.createElement("i");
          mdI.classList.add("fa");
          mdI.classList.add("fa-bookmark");
          var text = bookings[hour].name!=null ? document.createTextNode(" "+bookings[hour].name) : document.createTextNode(" Booked");
          mdDiv.appendChild(mdI);
          mdDiv.appendChild(text);

          // Create div for small to medium sized screens
          var smDiv = document.createElement("div");
          smDiv.classList.add("d-block");
          smDiv.classList.add("d-md-none");
          smDiv.classList.add("text-light");
          var smI = document.createElement("i");
          smI.classList.add("fa");
          smI.classList.add("fa-bookmark");
          smDiv.appendChild(smI);

          // Add td to row for this hour
          booking = bookings[hour];
          if(booking.length==2){
            td.setAttribute("rowspan","2");
          }
          td.setAttribute("style", "background-color: #343A40;");
          td.appendChild(mdDiv);
          td.appendChild(smDiv);
          td.setAttribute("id","room-"+room+"-hour-"+hour);

          var oldTd = document.getElementById("room-"+room+"-hour-"+hour);
          row.replaceChild(td,oldTd);
      }
    }
}

//Switch from upcoming hours to full day view
function switchFullDayView(){
  FULL_DAY_VIEW = !FULL_DAY_VIEW;
  setUpTable();
}

// Returns a string representation of the hours of a booking, given an hour and whether the booking is for two hours
function time_str(i, doubl){
    var next = doubl ? (i + 2) % 25 : (i + 1) % 25;
  return (i<10?'0'+i:i)+':00-'+(next<10?'0'+(next):next)+':00';
}

// Offset the DAY_OFFSET by a certain amount
function offset(change){
  if(NUM_REQS != 9) {
    alert("Please wait for outstanding requests to complete");
  } else {
    DAY_OFFSET += change;
    var d = new Date();
    console.log(DAY_OFFSET);
    d.setDate(d.getDate() + DAY_OFFSET);
    dateText = document.getElementById('date-text');
    var day_of_week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
    dateText.innerHTML = day_of_week + ", " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
    getRooms();
  }
}

//Books certain room for a certain hour
function book_room(num, hour) {
    var d = new Date();
    var today = new Date();
    d.setHours(hour);
    d.setDate(d.getDate() + DAY_OFFSET);
    var day_of_week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
    elem('form').setAttribute('action', 'https://www.scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr'+num+'.request.pl');
    elem('title').textContent = "Room "+num;
    elem('booking').className = 'booking';
    elem('formDate').textContent = day_of_week + ", " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
    elem('submit').setAttribute('value', 'Room '+num+' Submit Booking Request');
    elem('buttons').children[0].className = 'button selected';
    elem('buttons').children[0].textContent = time_str(hour%24);
    elem('buttons').children[1].className = 'button';
    elem('buttons').children[1].textContent = time_str(hour%24, true);
    elem('StartTime').value = hour%24 + 1;
    elem('EndTime').value = hour%24 + 2;
    elem('StartDate').value = d.getDate();
    elem('StartMonth').value = d.getMonth() + 1;
    elem('StartYear').value = 1 + (d.getFullYear() - today.getFullYear());
}

// Changes the EndTime value for a room booking (two hours or one hour in length)
function change_val(amt) {
    if(event.target.className == 'button') {
        elem('EndTime').value = parseInt(elem('EndTime').value) + amt;
        elem('buttons').querySelector('.button.selected').className = 'button';
        event.target.className = 'button selected';
    }
}

//
function validate(form) {
    return confirm("Booking " + elem('title').textContent + " for " +
        elem('buttons').querySelector('.button.selected').textContent + " on " +
        elem('formDate').textContent + ".\n\nPress OK to continue to SCSS.");
}

// Hide the room booking form
function hide_form() {
    if(event.target.getAttribute('onclick') == 'hide_form();')
        elem('booking').className = 'booking hidden';
}

// Quick syntax for getting element by its ID
function elem(e) {
    return document.getElementById(e);
}
