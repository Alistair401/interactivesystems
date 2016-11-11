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
                if(element.action == "pencil"){
                drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color);//,element.width);
                }
                if(element.action == "paintbrush" || element.action == "eraser"){
                    drawCircle(element.x,element.y,element.width,element.color);                     
                }

        }});
    });
    socket.on('chat-message', function(data) {
        $('#chat-log').append(data.user+": "+data.text + "<br>");
    });
    socket.on('moving', function (data) {
        if (data.drawing) {
            if(data.action == "pencil"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);//,data.width);               
            }
            if(data.action == "paintbrush" || data.action == "eraser"){  
                drawCircle(data.x,data.y,data.width,data.color);                
            }
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
        var colorUsed;
        
        if(currentTool == "paintbrush"){
            colorUsed = $("#color-input").val()
        }else if(currentTool == "eraser"){
            colorUsed = "white";
        }
            
        socket.emit('tool', {
            'prev_x': prev.x
            , 'prev_y': prev.y
            , 'x': e.pageX
            , 'y': e.pageY
            , 'action' : currentTool
            , 'drawing': active
            , 'color': colorUsed
            , 'width': $("#thickness-input").val()
            , });
        
        if (active) {
            switch (currentTool) {
            case "pencil":
                drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val());//,$("#thickness-input").val());
                prev.x = e.pageX;
                prev.y = e.pageY;
                break;
            case "eraser":
                drawCircle(e.pageX,e.pageY,$("#thickness-input").val(),"white");
                //eraseAt(e.pageX, e.pageY, $("#thickness-input").val());
                break;
            //NEW
            case "paintbrush":
                drawCircle(e.pageX,e.pageY,$("#thickness-input").val(),$("#color-input").val());
                break;
            }
            //END NEW
        }
    });

    function drawLine(fromx, fromy, tox, toy, color){//,width) {
        ctx.beginPath();
        ctx.moveTo(fromx, fromy - 64);
        ctx.lineTo(tox, toy - 64);
        ctx.strokeStyle = color;

        ctx.stroke();
    }

    function drawCircle(x,y,radius,color){
        ctx.beginPath();
        ctx.arc(x,y-64,radius,0,2*Math.PI,true);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    var nav_height;
    $(document).ready(function () {
        $(".thickness-picker").css("visibility", "visible");
        $(".color-picker").css("visibility", "visible");
        nav_height = $('nav').outerHeight();
        $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
        $(".btn").click(function () {
            if ($(this).val() == "pencil") {
                currentTool = "pencil";
            }
            if ($(this).val() == "eraser") {
                currentTool = "eraser";
            }
        });
        $(".clear-btn").click(function () {
            socket.emit('reset');
        })
        $('#send').click(function() {
            socket.emit('chat-message', {'user':null, 'text':$('#chat-box').val()});
        })
        $(window).resize(function () {
            nav_height = $('nav').outerHeight();
            $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
        });
    });
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
    $(".thickness-picker").css("visibility", "visible");
    $(".color-picker").css("visibility", "visible");
    nav_height = $('nav').outerHeight();
    $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
    $(".btn").click(function () {
        if ($(this).val() == "pencil") {
            currentTool = "pencil";
            $(".color-picker").css("visibility", "visible");
            $(".thickness-picker").css("visibility", "hidden");
        }
        if ($(this).val() == "paintbrush") {
            currentTool = "paintbrush";
            $(".color-picker").css("visibility", "visible");
            $(".thickness-picker").css("visibility", "visible");
        }
        if ($(this).val() == "eraser") {
            currentTool = "eraser";
            $(".color-picker").css("visibility", "hidden");
            $(".thickness-picker").css("visibility", "visible");
        }
    });

    $(window).resize(function () {
        nav_height = $('nav').outerHeight();
        $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
    });
});
