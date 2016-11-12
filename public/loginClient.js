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
  
  $("#login-submit").click(function(){
    socket.emit('login',{
      username: $('#login-username').val(),
      password: $('#login-password').val()
    });
  });
  
  socket.on('register_success', function () {
      $('#register-modal').modal('hide');
  });

  socket.on('register_fail', function () {
  });
  
  socket.on('login_success', function () {
      window.location.href = '/project';
  });

});
