var currentTool = null;
var messages = 0;
var chat_open = false;
var nav_height;
$(function () {
    if (!('getContext' in document.createElement('canvas'))) {
        alert('Sorry, it looks like your browser does not support canvas!');
        return false;
    }
    var doc = $(document)
        , win = $(window)
        , canvas = $('#main-canvas')
        , ctx = canvas[0].getContext('2d');
//    canvas.width = canvas.clientWidth;
//    canvas.height = canvas.clientHeight;
    // A flag for drawing activity
    var active = false;
    var socket = io();

    socket.emit("load_actions");
    socket.on("restore",function(base64){
        var image = new Image();
        image.src=base64;
        image.onload = function(){
            ctx.drawImage(image,0,0);
        }
             
    });
    socket.on("actions",function(data){
        data.forEach(function(element){
            if(element.drawing){
                if(element.action == "pencil"){
                    drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color);//,element.width);
                }
                if(element.action == "paintbrush"){
                    drawCircle(element.x,element.y,element.width,element.color);
                }
                if(element.action == "eraser"){
                    eraseAt(element.x, element.y, element.width);
                }
                if(element.action == "text"){
                    placeText(element.x, element.y, element.textValue, element.color, element.size, element.font);
                }
                if(element.action == "line"){
                    drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color);
                }
            }
        });
    });

    socket.on('chat-message', function(data) {
        if (chat_open == false)
        {
          messages++;
            $('#chat-badge').css("visibility","visible");
          drawNumMessages();
        }
        $('#chat-log').append(data.user+": "+data.text + "<br>");
    });
    socket.on('moving', function (data) {
        if (data.drawing) {
            if(data.action == "pencil"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);//,data.width);
            }
            if(data.action == "paintbrush"){
                drawCircle(data.x,data.y,data.width,data.color);
            }
            if(data.action == "eraser"){
                eraseAt(data.x,data.y,data.width);
            }
            if(data.action == "text"){
                placeText(data.x, data.y, data.textValue, data.color, data.size, data.font);
            }
            if(data.action == "line"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);
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
    
    canvas.bind('mouseup', function (e) {
        var fontSel = document.getElementById('font-picker');
        var fontSelValue = fontSel.options[fontSel.selectedIndex];
        if (currentTool == "text"){
            socket.emit('tool', {
                'x': e.pageX
                , 'y': e.pageY
                , 'action' : currentTool
                , 'drawing': active
                , 'textValue': $('#text-input').val()
                , 'color': $("#color-input").val()
                , 'size' :  $("#size-input").val()
                , 'font' : fontSelValue.text
                , });
            placeText(e.pageX, e.pageY, $('#text-input').val(), $("#color-input").val(), $("#size-input").val(), fontSelValue.text);
        }
        if (currentTool == "line"){
            socket.emit('tool', {
                'prev_x': prev.x
                , 'prev_y': prev.y
                , 'x': e.pageX
                , 'y': e.pageY
                , 'action' : currentTool
                , 'drawing': active
                , 'color': $("#color-input").val()
                , });
            drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val());
        }
        active = false;
    });
   
    canvas.bind('mouseleave', function (e) {
        active = false;
    });

    canvas.on('mousemove', function (e) {
        var colorUsed;

        if(currentTool == "paintbrush"){
            colorUsed = $("#color-input").val()
        }

        if (currentTool != "text" && currentTool != "line"){
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
        }
        if (active) {
            switch (currentTool) {
            case "pencil":
                drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val());//,$("#thickness-input").val());
                prev.x = e.pageX;
                prev.y = e.pageY;
                break;
            case "eraser":
                //drawCircle(e.pageX,e.pageY,$("#thickness-input").val(),"white");
                eraseAt(e.pageX, e.pageY, $("#thickness-input").val());
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
        ctx.moveTo(fromx, fromy - nav_height);
        ctx.lineTo(tox, toy - nav_height);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function drawCircle(x,y,radius,color){
        ctx.beginPath();
        ctx.arc(x,y-nav_height,radius,0,2*Math.PI,true);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function eraseAt(x, y, thickness) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y-nav_height, thickness, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();
        ctx.globalCompositeOperation = 'source-over';
    }

    function placeText(x, y, textInputVal, color, size, font){
        size = size.concat("px ");
        size = size.concat(font);
        console.log(size);
        ctx.font = size;
        ctx.fillStyle = color;
        ctx.fillText(textInputVal, x, y - nav_height);
    }
    
    function saveCanvas(){
        var image;
        image = canvas.get(0).toDataURL('image/png');
        socket.emit('save_canvas',{imagedata:image});
    }

        nav_height = $('nav').outerHeight();
        $(".thickness-picker").css("visibility", "visible");
        $(".color-picker").css("visibility", "visible");
        $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
        $('#chat-badge').css("top",(nav_height + 2) + "px");
        $(".btn").click(function () {
            if ($(this).val() == "pencil") {
                currentTool = "pencil";
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "hidden");
                $(".size-picker").css("visibility", "hidden");
                $(".text-picker").css("visibility", "hidden");
                $("#font-picker").css("visibility", "hidden");
            }
            if ($(this).val() == "paintbrush") {
                currentTool = "paintbrush";
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "visible");
                $(".size-picker").css("visibility", "hidden");
                $(".text-picker").css("visibility", "hidden");
                $("#font-picker").css("visibility", "hidden");
            }
            if ($(this).val() == "eraser") {
                currentTool = "eraser";
                $(".color-picker").css("visibility", "hidden");
                $(".thickness-picker").css("visibility", "visible");
                $(".size-picker").css("visibility", "hidden");
                $(".text-picker").css("visibility", "hidden");
                $("#font-picker").css("visibility", "hidden");
            }
            if ($(this).val() == "text") {
                currentTool = "text";
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "hidden");
                $(".size-picker").css("visibility", "visible");
                $(".text-picker").css("visibility", "visible");
                $("#font-picker").css("visibility", "visible");
            }
        });

        $("#drop li a").click(function() {
            if ($(this).children().html() == " Line Tool"){
                currentTool = "line";
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "hidden");
                $(".size-picker").css("visibility", "hidden");
                $(".text-picker").css("visibility", "hidden");
                $("#font-picker").css("visibility", "hidden");
            }
            if ($(this).children().html() == " Fill Tool"){
                currentTool = "fill";
            }
            if ($(this).children().html() == " Move Tool"){
                currentTool = "move";
            }
        });

        $('#send').click(function(){
            socket.emit('chat-message', {'user':null, 'text':$('#chat-box').val()})
        })

        $(window).resize(function () {
            nav_height = $('nav').outerHeight();
            $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
            $('#chat-badge').css("top",(nav_height + 2)  + "px");
        });
        
        $('#save').click(function(){
            console.log("Canvas saved");
            saveCanvas();
           
        });

});
// chat panel javascript
function toggleChat() {
    if (chat_open == false) {
        document.getElementById("chat-panel").style.width = "245px";
        chat_open = true;
        messages = 0;
        $('#chat-badge').css("visibility","hidden");
        drawNumMessages();
    }
    else {
        document.getElementById("chat-panel").style.width = "15px";
        chat_open = false;
        
        
    }
}
function drawNumMessages() {
  $("#num-messages").html(messages);
}
