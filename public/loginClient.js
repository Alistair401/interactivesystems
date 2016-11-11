$(document).ready(function () {
    var socket = io();
    $("#register-submit").click(function () {
        if ($("login-password-confirm").val() == $("login-password").val()) {
            console.log("registering " + $('#register-username').val());
            socket.emit('register_user', {
                'username': $('#register-username').val()
                , 'password': $('#register-password').val()
                , 'email': $('#register-email').val()
            });
        }
    });
});