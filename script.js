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

    if (password.length >= 8) {
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
    else {
        document.getElementById("regError").innerHTML = "Password must be atleast 8 characters long";
    }
}

function getOwnerData() {
    const user = Parse.User.current();
    document.getElementById("ownername").innerHTML = user.attributes.username;
}

function login() {
    var username = document.getElementById("username_login").value;
    var password = document.getElementById("pswd_login").value;
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

function logout() {
    Parse.User.logOut().then(function gotohome() {
        window.location.href = "home.html";
    });
}