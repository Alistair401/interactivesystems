$(document).ready(function () {
  var socket = io();
  $("#register-submit").click(function () {
    if ($("login-password-confirm").val() == $("login-password").val()) {
      socket.emit('register_user', {
        'username': $('#register-username').val(),
        'password': $('#register-password').val(),
        'email': $('#register-email').val()
      });
    }
  });

  socket.on('register_success', function () {
    console.log("registered");
  });

  socket.on('register_fail', function () {
    console.log("failed");
  });
});
