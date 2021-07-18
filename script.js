Parse.initialize(
    "RnGlQNbCqiZzPMNZC6ntIPYdo4dh9HspbP9R4QHF",
    "4gJ7qW7gixxcegpLl52ye5fd7dsPHd49oQLmR9hs"
);
Parse.serverURL = 'https://pg-app-l1q9134ksi5ivcf6bu5yeuerlqpzaw.scalabl.cloud/1/';

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
            const displayArea = document.getElementById("displayVenues");
            const colours = ["#8a068f", "#06148f", "#c70a62", "#0a9956", "#e78659", "#87b40d", "#0791b4", "#8609ce", "#4c7e80", "#c2427e", "#838080"];
            var i = 0; //counter for colour (i<11)
            results.forEach((venue, index) => {
                if (i == 11) { i = 0; }
                console.log(venue);
                var venuediv = document.createElement("div");
                venuediv.className = "venue col-sm-12 col-md-6 col-lg-3 mb-4";
                var photo = venue.get("image1").url();
                //[TODO : Here span always says occupied, check condition & add appropriate tags]
                venuediv.innerHTML =
                    `<div class='card' style ='border-bottom: 4px solid ${colours[i]};'>
                        <img class='card-img-top' height='230px' src='${photo}'>
                        <div class='card-body'>
                            <h5 class='card-title'>${venue.attributes.venueName}</h5>
                            <span class='tag tag-occupied'><small>occupied</small></span>
                        </div>
                    </div>`;
                displayArea.appendChild(venuediv);
                i += 1;

            });
        }
    }, function error(err) {
        alert('Error : ', err.message);
    });
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

function createVenue() {
    alert('Venue created');
}