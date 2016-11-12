$(document).ready(function () {
  var socket = io();
  console.log("test sent");
  socket.emit('test');
});
