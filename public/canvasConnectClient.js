var currentTool = null;
$(function () {
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }
    var doc = $(document)
        , win = $(window)
        , canvas = $('#main-canvas')
        , ctx = canvas[0].getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // A flag for drawing activity
    var active = false;
    var socket = io();


    socket.on("actions",function(data){
        data.forEach(function(element){
            if(element.drawing){
                drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color);
            }else if(element.erasing){
                eraseAt(element.x, element.y, element.thickness);
            }
        });
    });

    socket.on('moving', function (data) {
        if (data.drawing) {
            drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);
        }
    });
    socket.on('eraser', function (data) {
        if (data.erasing) {
            eraseAt(data.x, data.y, data.thickness);
        }
    });
    var prev = {};
    canvas.on('mousedown', function (e) {
        e.preventDefault();
        active = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
    });
    canvas.bind('mouseup mouseleave', function () {
        active = false;
    });
    canvas.on('mousemove', function (e) {
        if (currentTool == "pencil") {
            socket.emit('pencil', {
                'prev_x': prev.x
                , 'prev_y': prev.y
                , 'x': e.pageX
                , 'y': e.pageY
                , 'drawing': active
                , 'color': $("#color-input").val()
            , });
        }
        if (currentTool == "eraser") {
            socket.emit('eraser', {
                'x': e.pageX
                , 'y': e.pageY
                , 'erasing': active
                , 'thickness': $("#thickness-input").val()
            , })
        }
        if (active) {
            switch (currentTool) {
            case "pencil":
                drawLine(prev.x, prev.y - 64, e.pageX, e.pageY - 64, $("#color-input").val());
                prev.x = e.pageX;
                prev.y = e.pageY;
                break;
            case "eraser":
                eraseAt(e.pageX, e.pageY - 64, $("#thickness-input").val());
                break;
            }
        }
    });

    function drawLine(fromx, fromy, tox, toy, color) {
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function eraseAt(x, y, thickness) {
        ctx.beginPath();
        ctx.clearRect(x - (thickness / 2), y - 64 - (thickness / 2), thickness, thickness);
        //ctx.clearRect(x-(thickness/2),y-(thickness/2)-64,x+(thickness/2),y+(thickness/2)-64);
    }
});
// chat panel javascript
function openChat() {
    document.getElementById("chat-panel").style.width = "250px";
}

function closeChat() {
    document.getElementById("chat-panel").style.width = "0px";
}
var chat_open = false;

function toggleChat() {
    if (chat_open == false) {
        document.getElementById("chat-panel").style.width = "245px";
        chat_open = true;
    }
    else {
        document.getElementById("chat-panel").style.width = "15px";
        chat_open = false;
    }
}
var nav_height;
$(document).ready(function () {
    nav_height = $('nav').outerHeight();
    $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
    $(".btn").click(function () {
        if ($(this).val() == "pencil") {
            currentTool = "pencil";
            $(".color-picker").css("visibility", "visible");
        }
        if ($(this).val() == "eraser") {
            currentTool = "eraser";
            $(".thickness-picker").css("visibility", "visible");
        }
    });
    $(window).resize(function () {
        nav_height = $('nav').outerHeight();
        $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
    });
});