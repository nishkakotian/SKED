Parse.initialize(
    "RnGlQNbCqiZzPMNZC6ntIPYdo4dh9HspbP9R4QHF",
    "4gJ7qW7gixxcegpLl52ye5fd7dsPHd49oQLmR9hs"
);
Parse.serverURL = 'https://pg-app-l1q9134ksi5ivcf6bu5yeuerlqpzaw.scalabl.cloud/1/';

var i = 0; //iterator for colours in venue cards
const colours = ["#8a068f", "#06148f", "#c70a62", "#0a9956", "#e78659", "#87b40d", "#0791b4", "#8609ce", "#4c7e80", "#c2427e", "#838080"];

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

function emptyError(errorContainerId) {
    document.getElementById(errorContainerId).innerHTML = "";
}

function insertDetails() {
    let params = new URLSearchParams(location.search);
    let venueId = params.get('id');
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

        document.getElementById("dataHolder").classList.add("bg-dark");
    }, (error) => {
        // The object was not retrieved successfully.
        alert("Error occured: ", error.message);
    });
}

function venueDetails(el) {
    window.location.href = "venue.html?id=" + el.id;
}

function displayVenue(displayArea, venue) {
    var venuediv = document.createElement("div");
    venuediv.className = "venue col-sm-12 col-md-6 col-lg-3 mb-4";
    var photo = venue.get("image1").url();
    var objId = venue.id;
    //[TODO : Here span always says free, check condition & add appropriate tags]
    venuediv.innerHTML =
        `<div class='card' id='${objId}' onclick='venueDetails(this)' style ='border-bottom: 4px solid ${colours[i]};'>
            <img class='card-img-top' height='230px' src='${photo}'>
            <div class='card-body'>
                <h5 class='card-title'>${venue.attributes.venueName}</h5>
                <span class='tag tag-free'><small>free</small></span>
            </div>
        </div>`;
    displayArea.appendChild(venuediv);
}

function getOwnerData() {
    const user = Parse.User.current();
    document.getElementById("ownername").innerHTML = user.attributes.username;

    const Venues = Parse.Object.extend("Venues");
    const query = new Parse.Query(Venues);
    query.equalTo("ownerName", user.attributes.username);
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
    }, function error(err) {
        alert('Error : ', err.message);
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
            document.getElementById("filterNoResults").innerHTML = "No venues found in " + loc;
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
        venue.set("ownerName", owner.get("username"));
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
            alert("Venue added successfully!");
        }, function error(err) {
            alert("Error adding venue : " + err);
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