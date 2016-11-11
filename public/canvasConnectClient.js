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
                if(element.action == "paintbrush"){
                    drawCircle(element.x,element.y,element.width,element.color);                     
                }
            }else if(element.erasing){
                eraseAt(element.x, element.y, element.thickness);
            }
        });
    });

    socket.on('moving', function (data) {
        if (data.drawing) {
            if(data.action == "pencil"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);//,data.width);               
            }
            if(data.action == "paintbrush"){  
                drawCircle(data.x,data.y,data.width,data.color);                
            }
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
            socket.emit('tool', {
                'prev_x': prev.x
                , 'prev_y': prev.y
                , 'x': e.pageX
                , 'y': e.pageY
                , 'action' : "pencil"
                , 'drawing': active
                , 'color': $("#color-input").val()
            , });
        }
        //NEW
        if (currentTool == "paintbrush") {
            socket.emit('tool', {
                'x': e.pageX
                , 'y': e.pageY
                , 'action' : "paintbrush"
                , 'drawing': active
                , 'color': $("#color-input").val()
                , 'width': $("#thickness-input").val()
            , });
        }
        //END NEW
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
                drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val());//,$("#thickness-input").val());
                prev.x = e.pageX;
                prev.y = e.pageY;
                break;
            case "eraser":
                eraseAt(e.pageX, e.pageY, $("#thickness-input").val());
                break;
            //NEW
            case "paintbrush":
                drawCircle(e.pageX,e.pageY,$("#thickness-input").val(),$("#color-input").val());
            }
            //END NEW
        }
    });

    function drawLine(fromx, fromy, tox, toy, color){//,width) {
        ctx.beginPath();
        ctx.moveTo(fromx, fromy - 64);
        ctx.lineTo(tox, toy - 64);
        ctx.strokeStyle = color;
        //ctx.lineWidth = width;
        ctx.stroke();
    }

    //NEW
    function drawCircle(x,y,radius,color){
        ctx.beginPath();
        ctx.arc(x,y-64,radius,0,2*Math.PI,true);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    //END NEW

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
