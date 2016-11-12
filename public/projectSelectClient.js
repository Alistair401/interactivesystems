$(document).ready(function () {
    var socket = io();
    socket.emit('get_projects');
    socket.on('list_projects', function (data) {
        if (data.length > 0){
            data.forEach(function(item,index){
                $('#project-select').append('<div value="'+item.id+'" class="btn btn-default btn-block btn-primary">'+item.title+'</div>');
            });
        }
    });
});
