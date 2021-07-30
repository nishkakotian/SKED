Parse.initialize(
    "RnGlQNbCqiZzPMNZC6ntIPYdo4dh9HspbP9R4QHF",
    "4gJ7qW7gixxcegpLl52ye5fd7dsPHd49oQLmR9hs"
);
Parse.serverURL = 'https://pg-app-l1q9134ksi5ivcf6bu5yeuerlqpzaw.scalabl.cloud/1/';

var i = 0; //iterator for colours in venue cards
const colours = ["#8a068f", "#06148f", "#c70a62", "#0a9956", "#e78659", "#87b40d", "#0791b4", "#8609ce", "#4c7e80", "#c2427e", "#838080"];
var params, venueId;
var flag;

//Function to toggle the type for password input element
function visibilityToggle(pswdId, iconId) {
    const pswdel = document.getElementById(pswdId);
    const eyeicon = document.getElementById(iconId);

    if (pswdel.type == "password") {
        pswdel.type = "text";
        eyeicon.classList.add("fa-eye");
        eyeicon.classList.remove("fa-eye-slash");
    }
    else {
        pswdel.type = "password";
        eyeicon.classList.add("fa-eye-slash");
        eyeicon.classList.remove("fa-eye");
    }
}

function register(el) {
    const username = document.getElementById("username_reg").value;
    const password = document.getElementById("pswd_reg").value;

    var user_type;
    if (el.id == "OwnerRegbtn") {
        user_type = "Owner";
    }
    else {
        user_type = "Customer";
    }

    if (username.length == 0) {
        document.getElementById("regError").innerHTML = "Username cannot be empty";
    }
    else if (password.length < 8 || password.length > 16) {
        document.getElementById("regError").innerHTML = "Password must be between 8-16 characters long";
    }
    else {
        const user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("userType", user_type);

        user.signUp().then(function success() {
            window.location.href = "registered.html";
        }, function error(err) {
            document.getElementById("regError").innerHTML = err.message;
        });
    }
}

function login() {
    var username = document.getElementById("username_login").value;
    var password = document.getElementById("pswd_login").value;

    if (username.length == 0) {
        document.getElementById("loginError").innerHTML = "Please enter the username";
    }
    else if (password.length < 8 || password.length > 16) {
        document.getElementById("loginError").innerHTML = "Passwords are between 8-16 characters long.";
    }
    else {
        Parse.User.logIn(username, password, { usePost: true }).then(function success() {
            const user = Parse.User.current();
            if (user.attributes.userType == "Owner") {
                window.location.href = "owner.html";
            }
            else { /*user.attributes.userType == "Customer"*/
                window.location.href = "customer.html";
            }
        }, function error(err) {
            document.getElementById("loginError").innerHTML = err.message;
        });
    }
}

function logout() {
    Parse.User.logOut().then(function gotohome() {
        window.location.href = "home.html";
    });
}

function logout_customer() {
    Parse.User.logOut().then(function gotohome_customer() {
        window.location.href = "home_customer.html";
    });
}

function emptyError(errorContainerId) {
    document.getElementById(errorContainerId).innerHTML = "";
}

function insertDetails() {
    params = new URLSearchParams(location.search);
    venueId = params.get('id');
    const Venue = Parse.Object.extend("Venues");
    const query = new Parse.Query(Venue);
    query.get(venueId).then((venue) => {
        // The object was retrieved successfully.
        document.getElementById("brand").innerHTML = venue.get("venueName");

        document.getElementById("img1container").innerHTML = `<img class="d-block w-100" src="${venue.get("image1").url()}" alt="First Image" style="max-height:720px">`

        document.getElementById("img2container").innerHTML = `<img class="d-block w-100" src="${venue.get("image2").url()}" alt="Second Image" style="max-height:720px">`

        document.getElementById("desc").innerHTML = venue.get("description");
        document.getElementById("city").innerHTML = venue.get("city");
        document.getElementById("address").innerHTML = venue.get("address");
        document.getElementById("days").innerHTML = venue.get("daysAvailable");
        document.getElementById("timing").innerHTML = venue.get("timings");

        var hiddencontent = document.getElementsByClassName("whileLoadHide");
        while (hiddencontent.length != 0) {
            hiddencontent[0].classList.remove("whileLoadHide");
        }
        document.getElementById("loader").style.display = "none";

    }, (err) => {
        // The object could not be retrieved.
        alert("Error occured: ", err.message);
        document.getElementById("loader").style.display = "none";

    });
}

function venueDetails(el) {
    window.location.href = "venue.html?id=" + el.id;
}

function approveReq(el, id) {

    if (el.innerHTML == "Approved") {
        return;
    }

    const Booking = Parse.Object.extend("Booking");
    const q = new Parse.Query(Booking);
    q.get(id).then((object) => {
        object.set("approvedStatus", true);
        object.save().then((booking) => {

            //create a row in ApprovedBookings class which has public read access
            const ApprovedBookings = Parse.Object.extend("ApprovedBookings");
            const approved = new ApprovedBookings();

            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            acl.setWriteAccess(Parse.User.current(), true);

            approved.set("date", booking.get("date"));
            approved.set("timeSlot", booking.get("timeSlot"));
            approved.set("venueID", booking.get("venue").id);
            approved.set("parent", object);
            approved.setACL(acl);
            approved.save().then(function () {
                console.log("approved and saved!");
            }, function error(err) {
                console.log(err);
            });

            el.innerHTML = "Approved";
            el.classList.remove("cardpink-btn");
            el.classList.add("cardpurple-btn");
            const card = document.getElementById(id);
            card.classList.remove("cardpink-bg");
            card.classList.add("cardpurple-bg");
        }, function error(err) {
            console.log(err);
        });
    });

}

function deleteBooking(bookingid) {
    const Booking = Parse.Object.extend("Booking");
    const query = new Parse.Query(Booking);

    query.get(bookingid).then((bking) => {

        const status = bking.get("approvedStatus");

        //If approved,first remove record from ApprovedBookings class.
        if (status) {
            const apprBookings = Parse.Object.extend("ApprovedBookings");
            const q = new Parse.Query(apprBookings);
            q.equalTo("parent", bking);
            q.find().then((result) => {
                result[0].destroy().then(() => {
                    console.log("Deleted booking from ApprovedBookings");

                    //Next remove from Booking class
                    bking.destroy().then(() => {
                        const bookingcard = document.getElementById(bookingid);
                        bookingcard.parentElement.removeChild(bookingcard);
                        console.log("Deleted from Booking");
                    });
                });
            }, (err) => {
                console.log(err);
            });
        }
        else { //just remove the non approved booking from Booking class
            bking.destroy().then(() => {
                const bookingcard = document.getElementById(bookingid);
                bookingcard.parentElement.removeChild(bookingcard);
                console.log("Deleted from Booking");
            }, (err) => {
                console.log(err);
            });
        }
    });
}

function displayVenue(displayArea, venue) {
    var venuediv = document.createElement("div");
    venuediv.className = "venue col-md-6 col-lg-3 mb-4 d-flex align-items-stretch text-center";
    var photo = venue.get("image1").url();
    var objId = venue.id;

    venuediv.innerHTML =
        `<div class='card' id='${objId}' onclick='venueDetails(this)' style ='border-bottom: 4px solid ${colours[i]};'>
            <img class='card-img-top' height='230px' src='${photo}'>
            <div class='card-body'>
                <h5 class='card-title'>${venue.get("venueName")}</h5>
                <span class='tag tag-place'><small>${venue.get("city")}</small></span>
            </div>
        </div>`;
    displayArea.appendChild(venuediv);
}

function displayBooking(displayArea, booking, isOwner) {
    var bookingdiv = document.createElement("div");
    bookingdiv.className = "col-12";
    var name = booking.get("fullName");
    var email = booking.get("email");

    var venueName = booking.get("venue").get("venueName");
    var bookingdate = booking.get("date").split("-");
    var date = [bookingdate[2], bookingdate[1], bookingdate[0]].join("-"); //convert to dd-mm-yyyy format
    var timeSlot = booking.get("timeSlot");
    var details = booking.get("details");
    var bookingId = booking.id;

    var status = booking.get("approvedStatus"); //boolean value.True if approved.
    var status_showCustomer, status_showOwner, color_class_card, color_class_btn;
    if (status) {
        status_showCustomer = "Approved";
        status_showOwner = "Approved";
        color_class_card = "cardpurple-bg";
        color_class_btn = "cardpurple-btn";
    }
    else {
        status_showCustomer = "Approval Pending";
        status_showOwner = "Approve";
        color_class_card = "cardpink-bg";
        color_class_btn = "cardpink-btn";
    }

    var d = new Date();
    var d_year = d.getFullYear();
    var d_month = (d.getMonth() + 1).toString().padStart(2, "0");
    var d_date = d.getDate().toString().padStart(2, "0");

    var bd = new Date(bookingdate[0], parseInt(bookingdate[1]) - 1, bookingdate[2]);

    var deleteDisplay;
    if (bd.getTime() < d.getTime()) {
        deleteDisplay = 'inline';
    }
    else {
        deleteDisplay = 'none';
    }

    if (isOwner == true) {
        bookingdiv.innerHTML =
            `<div class="card mb-3 ${color_class_card}" id="${bookingId}">
                <div class="card-header">
                    ${name} [${email}]
                    <button class="delete-btn" onclick="deleteBooking('${bookingId}')" style="display:${deleteDisplay};"><i class="far fa-trash-alt"></i></button>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${venueName} , ${date}  &nbsp; ${timeSlot}</h5>
                    <p class="card-text">${details}</p>
                    <button onclick="approveReq(this,'${bookingId}')" class="btn text-light ${color_class_btn}">${status_showOwner}</button>
                </div>
            </div>`;

        //today's events tab
        if (status && date == d_date + "-" + d_month + "-" + d_year) {
            if (!flag) {
                flag = true; //found atleast one event for that day
            }
            const todays = document.getElementById("displayTodaysEvents");
            const divelement = document.createElement("div");
            divelement.innerHTML =
                `<div class="card mb-3 card-green" >
                    <div class="card-header">
                        <h5>${venueName} , ${timeSlot}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${details}</p>
                    </div>
                </div > `;
            todays.appendChild(divelement);
        }
    }
    else { //is Customer
        bookingdiv.innerHTML =
            `<div class="card mb-3 ${color_class_card}">
                <div class="card-header">
                    <h5>${venueName} , ${date} &nbsp; ${timeSlot}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${details}</p>
                    <div class="btn text-light ${color_class_btn}">${status_showCustomer}</div>
                </div>
            </div>`;
    }
    displayArea.appendChild(bookingdiv);
}

function getOwnerData() {
    const user = Parse.User.current();
    document.getElementById("ownername").innerHTML = user.attributes.username;

    const Venues = Parse.Object.extend("Venues");
    const query = new Parse.Query(Venues);
    query.equalTo("owner", user);
    query.find().then(function findVenues(results) {
        if (results.length == 0) {
            document.getElementById("novenues").classList.remove("d-none");
        } else {
            document.getElementById("yourVenuesHeading").classList.remove("d-none");
            const displayArea = document.getElementById("displayVenues");
            results.forEach((venue, index) => {
                if (i == 11) { i = 0; }
                displayVenue(displayArea, venue);
                i += 1;
            });
        }

        const Booking = Parse.Object.extend("Booking");
        const query2 = new Parse.Query(Booking);

        query2.equalTo("owner", user);
        query2.descending("createdAt");
        query2.find().then(function findBookings(results) {
            flag = false;
            if (results.length == 0) {
                document.getElementById("nobookings").classList.remove("d-none");
            } else {
                document.getElementById("bookingReq").classList.remove("d-none");
                const displayArea = document.getElementById("displayBookings");
                results.forEach((results, index) => {
                    displayBooking(displayArea, results, true);
                });
            }
            if (!flag) {
                document.getElementById("nothingToday").classList.remove("d-none");
            }
            else {
                document.getElementById("events2day").classList.remove("d-none");
            }
        });
    }, function error(err) {
        console.log('Error : ', err);
    });
}

function filterVenues() {
    document.getElementById("filterNoResults").innerHTML = "";
    var loc = document.getElementById("locationfilter").value;
    const Venues = Parse.Object.extend("Venues");
    const query = new Parse.Query(Venues);
    query.equalTo("city", loc);
    query.find().then(function findVenues(results) {
        if (results.length == 0) {
            document.getElementById("filterNoResults").innerHTML = "No venues found !";
        } else {
            const displayArea = document.getElementById("showVenuesHomepg");
            displayArea.textContent = ""; //Remove all venues so as to display only the filtered venues
            results.forEach((venue, index) => {
                if (i == 11) { i = 0; }
                displayVenue(displayArea, venue);
                i += 1;
            });
        }
    }, function error(err) {
        alert('Error : ', err.message);
    });
}

function createVenue() {
    document.getElementById("addVenueError").innerHTML = "";
    const venuename = document.getElementById("nameOfVenue").value;
    const address = document.getElementById("addr").value;
    const city = document.getElementById("cityName").value;
    const daysAvailable = document.getElementById("days").value;
    const topen = document.getElementById("topen").value;
    const tclose = document.getElementById("tclose").value;
    const timing = topen + "-" + tclose; //[TODO: Convert to AM-PM format]

    const image1 = document.getElementById("image1");
    const image2 = document.getElementById("image2");

    const desc = document.getElementById("desc").value;

    //Client side validation to check that all fields are entered
    if (!venuename || !address || !city || !daysAvailable || !topen || !tclose || image1.files.length == 0 || image2.files.length == 0 || !desc) {
        document.getElementById("addVenueError").innerHTML = "Please fill all the fields.";
    }
    else {
        const parseFileImg1 = new Parse.File("img1.jpeg", image1.files[0]);
        const parseFileImg2 = new Parse.File("img2.jpeg", image2.files[0]);

        const owner = Parse.User.current();

        const Venue = Parse.Object.extend("Venues");
        const venue = new Venue();

        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setWriteAccess(owner.id, true);

        venue.setACL(acl);
        venue.set("owner", owner); //pointer to owner
        venue.set("venueName", venuename);
        venue.set("address", address);
        venue.set("city", city);
        venue.set("daysAvailable", daysAvailable);
        venue.set("timings", timing);
        venue.set("image1", parseFileImg1);
        venue.set("image2", parseFileImg2);
        venue.set("description", desc);

        venue.save().then(function success(venue) {
            const displayArea = document.getElementById("displayVenues");
            displayVenue(displayArea, venue);
            i += 1;
            if (i == 11) { i = 0; }
            location.reload();
            // alert("Venue added successfully!");
        }, function error(err) {
            alert("Error adding venue : " + err.message);
        });
    }

};

function showVenues() {
    const Venues = Parse.Object.extend("Venues");
    const query = new Parse.Query(Venues);
    query.limit(25);
    query.find().then(function success(results) {
        results.forEach((venue, index) => {
            const displayArea = document.getElementById("showVenuesHomepg");
            if (i == 11) { i = 0 };
            displayVenue(displayArea, venue);
            i += 1;
        });

    }, function error(err) {
        console.log("Error : ", err);
    });
}

function checkbooked(year, month, date) {
    const displayDiv = document.getElementById("bookingsDone");
    while (displayDiv.firstChild) { //remove any previous timings displayed
        displayDiv.removeChild(displayDiv.firstChild);
    }

    const datecheck = year + "-" + month.toString().padStart(2, '0') + "-" + date.toString().padStart(2, '0');

    const Venues = Parse.Object.extend("Venues");
    const apprBooking = Parse.Object.extend("ApprovedBookings");
    const query = new Parse.Query(apprBooking);
    query.equalTo("venueID", venueId);
    query.equalTo("date", datecheck);
    query.find().then(function success(results) {
        var spanEl;
        if (results.length == 0) {
            spanEl = document.createElement("span");
            spanEl.className = "tag bg-warning";
            spanEl.innerHTML = "No bookings to show";
            displayDiv.appendChild(spanEl);
        }
        else {
            results.forEach((booking) => {
                spanEl = document.createElement("span");
                spanEl.className = "tag tag-booked";
                spanEl.innerHTML = booking.get("timeSlot");
                displayDiv.appendChild(spanEl);
            });
        }
    }, function error(err) {
        console.log(err);
    });
}

function fillDates(mm, yy, today) {
    var d = new Date(yy, mm, 1);
    var firstday = d.getDay(); // weekday for the 1st day of that month 

    const datesarea = document.getElementById("dayscontainer");

    document.getElementById("monthandyear").innerHTML = months[mm] + " " + yy;

    for (let j = 1; j <= firstday; j++) {
        const emptyspan = document.createElement("span");
        datesarea.appendChild(emptyspan);
    }

    var numofdays = new Date(yy, mm + 1, 0).getDate();//get number of days in that month

    for (let j = 1; j <= numofdays; j++) {
        var dd = new Date(yy, mm, j);

        // dd.setHours(23, 59, 59, 999); 

        if (dd.getTime() >= today.getTime()) {
            dates = `<button class="future" onclick="checkbooked(${yy},${mm + 1},${j})">${j}</button>`;
        }
        else {
            dates = `<button disabled class="past">${j}</button>`;
        }
        datesarea.innerHTML += dates;
    }
}

function getDates() {
    var dd = today.getDate().toString().padStart(2, '0');
    var mm = today.getMonth();
    var yy = today.getFullYear();

    mmcounter = mm;
    yycounter = yy;

    let month = (mm + 1).toString().padStart(2, '0');
    document.getElementById("date").setAttribute("min", yy + "-" + month + "-" + dd);

    fillDates(mmcounter, yycounter, today);
}

function nextDates() {
    mmcounter += 1;
    if (mmcounter == 12) {
        yycounter += 1;
        mmcounter = 0;
    }
    document.getElementById("dayscontainer").textContent = "";
    fillDates(mmcounter, yycounter, today);
}

function prevDates() {
    mmcounter -= 1;
    if (mmcounter == -1) {
        yycounter -= 1;
        mmcounter = 11;
    }
    document.getElementById("dayscontainer").textContent = "";
    fillDates(mmcounter, yycounter, today);
}

function bookVenue() {
    document.getElementById("bookingError").innerHTML = "";
    const name = document.getElementById("custName").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const timeStart = document.getElementById("starttime").value
    const timeEnd = document.getElementById("endtime").value;
    const details = document.getElementById("purpose").value;

    if (!name || !email || !date || !timeStart || !timeEnd || !details) {
        document.getElementById("bookingError").innerHTML = "Please fill all the fields.";
    }
    else {
        const user = Parse.User.current();
        // let params = new URLSearchParams(location.search);
        // let venueId = params.get('id');

        const Venues = Parse.Object.extend("Venues");
        const q = new Parse.Query(Venues);
        q.get(venueId).then(function success(object) {
            var ownerOfVen = object.get("owner");

            const Booking = Parse.Object.extend("Booking");
            const booking = new Booking();

            var acl = new Parse.ACL();
            acl.setReadAccess(user, true);
            acl.setReadAccess(ownerOfVen, true);
            acl.setWriteAccess(ownerOfVen, true);

            booking.set("ACL", acl);
            booking.set("fullName", name);
            booking.set("email", email);
            booking.set("date", date);
            booking.set("timeSlot", timeStart + " - " + timeEnd);
            booking.set("details", details);
            booking.set("venue", object);
            booking.set("owner", ownerOfVen);
            booking.set("bookedBy", user);
            booking.set("approvedStatus", false);

            booking.save().then(function success(booking) {
                document.getElementById("venueBookForm").reset();
                document.getElementById("bookingSuccess").innerHTML = "Booking done successfully!";
                console.log("Booking done!");
            }, function error(err) {
                console.log("Error: ", err);
            });
        }, function error(err) {
            console.log(err);
        });
    }
}

function getCustomerBookings() {
    const displayArea = document.getElementById("customerBookings");
    const user = Parse.User.current();
    const Booking = Parse.Object.extend("Booking");
    const query = new Parse.Query(Booking);
    query.equalTo("bookedBy", user);
    query.descending("createdAt");
    query.include("venue");
    query.find().then(function (results) {
        if (results.length == 0) {
            displayArea.innerHTML = "You don't have any bookings!";
            displayArea.className = " mt-4 alert alert-primary d-none";
        }
        else {
            results.forEach((booking) => {
                displayBooking(displayArea, booking, false);
            });
        }
    });
}

function showBookings(el) {
    if (el.innerHTML == "Show Venues") {
        el.innerHTML = "Show Bookings";
        document.getElementById("customerBookings").classList.add("d-none");
        document.getElementById("venues").style.display = "block";
    }
    else {
        el.innerHTML = "Show Venues";
        document.getElementById("venues").style.display = "none";
        document.getElementById("customerBookings").classList.remove("d-none");
    }

}
