$(document).ready(function () {
    var socket = io();
    socket.emit('get_projects');
    socket.on('list_projects', function (data) {
        $('#project-select').append('<p>test</p>')
    });
});
