$(document).ready(function () {
    var socket = io();
    refreshProjects();
    socket.on('list_projects', function (data) {
        if (data.length > 0){
            data.forEach(function(item,index){
                $('#project-select').append('<div value="'+item.id+'" class="btn btn-default btn-block btn-primary project">'+item.title+'<b class="cust-grey-text"> #'+item.id+'</b></div>');
            });
        }
    });
    $('#project-submit').click(function(){
        socket.emit('add_project',{title:$('#project-title').val()});
    });
    socket.on('add_project_success',function(){
        $('#project-modal').modal('hide');
        $('.project').remove();
        refreshProjects();
    });

    function refreshProjects(){
        socket.emit('get_projects');
    }
});

