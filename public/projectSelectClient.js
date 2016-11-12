$(document).ready(function () {
    var socket = io();
    refreshProjects();
    socket.on('list_projects', function (data) {
        if (data.length > 0) {
            data.forEach(function (item, index) {
                $('#project-select').append('<div id="' + item.id + '" class="btn btn-default btn-block btn-primary project">' + item.title + '<b class="cust-grey-text"> #' + item.id + '</b></div>');
            });
        } else {
            //            $('#project-select').append('<h3>You </h3>')
        }
    });
    $('#project-submit').click(function () {
        socket.emit('add_project', {
            title: $('#project-title').val();
        });
    });

    $('#project-select').on('click', '.project', function () {
        window.location.href = '/session/' + $(this).attr("id");
    });

    socket.on('add_project_success', function () {
        $('#project-modal').modal('hide');
        $('.project').remove();
        refreshProjects();
    });

    function refreshProjects() {
        socket.emit('get_projects');
    }

});
