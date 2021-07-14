Parse.initialize(
    "RnGlQNbCqiZzPMNZC6ntIPYdo4dh9HspbP9R4QHF",
    "4gJ7qW7gixxcegpLl52ye5fd7dsPHd49oQLmR9hs"
);
Parse.serverURL = 'https://pg-app-l1q9134ksi5ivcf6bu5yeuerlqpzaw.scalabl.cloud/1/';

function register() {
    var username = document.getElementById("username_reg").value;
    var password = document.getElementById("pswd_reg").value;

    var user = new Parse.User();
    user.set("username", username);
    user.set("password", password);

    user.signUp().then(function success(user) {
        window.location.href = "registered.html";
    }, function error(err) {
        errmsg = JSON.stringify(err);
        errobj = JSON.parse(errmsg);
        document.getElementById("regError").innerHTML = errobj.message;
    });
}

function login() {
    var username = document.getElementById("username_login").value;
    var password = document.getElementById("pswd_login").value;
    Parse.User.logIn(username, password, { usePost: true }).then(function success(user) {
        window.location.href = "owner.html";
    }, function error(err) {
        errmsg = JSON.stringify(err);
        errobj = JSON.parse(errmsg);
        document.getElementById("loginError").innerHTML = errobj.message;
    });
}

function logout() {
    Parse.User.logOut().then(function gotohome(user) {
        window.location.href = "home.html";
    });
};