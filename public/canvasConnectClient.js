var currentTool = null;
var symbol = null;
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
    // A flag for drawing activity
    var active = false;
    var socket = io();
    var img;

    socket.emit("load_actions");

    socket.on("actions",function(data){
        function callback(){
            drawData(data.actions);
        }
        if (data.save){
            drawSaveData(data.save.src,callback);
        }
        
    });

    function drawData(data){
        data.forEach(function(element){
            if(element.drawing){
                if(element.action == "pencil"){
                    drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color, 1);
                }
                if(element.action == "paintbrush"){
                    drawCircle(element.x,element.y,element.width,element.color);
                }
                if(element.action == "eraser"){
                    eraseAt(element.x, element.y, element.width);
                }
                if(element.action == "text"){
                    placeText(10, element.y + element.previousTextSize, element.textValue, element.color, element.size, element.font);
                }
                if(element.action == "line"){
                    drawLine(element.prev_x, element.prev_y, element.x, element.y, element.color, element.width);
                }
                if(element.action == "import"){
                    ctx.drawImage(element.img, element.x-10, element.y-88, 900, 900);
                }
                if(element.action == "symbol"){
                    placeText(element.x, element.y, element.textValue, element.color, element.size, element.font);
                }
                if(element.action == "clear"){
                    console.log("Canvas cleared from load")
                    ctx.clearRect(0,0,1920,1080);
                }
                

            }
        });
    };

    socket.on('chat-message', function(data) {
        if (chat_open == false)
        {
          messages++;
            $('#chat-badge').css("visibility","visible");
          drawNumMessages();
        }
        $('#chat-log').append(data.user+": "+data.text + "<br>");
    });


    socket.on("clearing",function(data){
        console.log(data);
        drawData(data);
    })

    socket.on("clearCanvas1",function(data){
        console.log("Canvas cleared");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.canvas.width = ctx.canvas.width;
    });

    socket.on('moving', function (data) {
        if (data.drawing) {
            if(data.action == "pencil"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color, 1);
            }
            if(data.action == "paintbrush"){
                drawCircle(data.x,data.y,data.width,data.color);
            }
            if(data.action == "eraser"){
                eraseAt(data.x,data.y,data.width);
            }
            if(data.action == "text"){
                ctx.clearRect(10, data.previousTextSize, ctx.measureText(data.previousText).width, data.previousTextSize + data.parsedSize);
                placeText(10, data.y + data.previousTextSize, data.textValue, data.color, data.size, data.font);
            }
            if(data.action == "line"){
                drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color, data.width);
            }
            if(data.action == "import"){
                img = document.createElement("img");
                img.innerHTML = '<img src="#" alt="Imported image" width="220" height="277"/>';
                img.id = 'importImg';
                img.src = data.src;
                ctx.drawImage(img, data.x-10, data.y-88, data.w, data.h);
            }
            if(data.action == "symbol"){
                var localSymbol = data.textValue;
                placeText(data.x, data.y, localSymbol, data.color, data.size, data.font )
            }
        }
    });

    var prev = {};
    canvas.on('mousedown', function (e) {
        e.preventDefault();
        active = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
        if (currentTool == "import"){
            var sizeInput = $("#size-input").val();
            var sizeInputSplit = sizeInput.split(" "); 
            var w = sizeInputSplit[0];
            var h = sizeInputSplit[1];
            socket.emit('tool', {
                'x': e.pageX
                , 'y': e.pageY
                , 'action' : currentTool
                , 'drawing': active
                , 'src': img.src
                , 'w': w
                , 'h': h
                , });
            ctx.drawImage(img, e.pageX-10, e.pageY-88, w, h);
        }
    });

    canvas.bind('mouseup', function (e) {
        var fontSel = document.getElementById('font-picker');
        var fontSelValue = fontSel.options[fontSel.selectedIndex];
        if (currentTool == "symbol" && symbol != null){
            socket.emit('tool', {
                'x': e.pageX
                , 'y': e.pageY
                , 'action' : currentTool
                , 'drawing': active
                , 'textValue': symbol
                , 'size' :  $("#symbol-size-input").val()
                , 'color' : $('#symbol-color-input').val()
                , 'font' : 'serif'
                , });
            var localSymbol = symbol;
            placeText(e.pageX, e.pageY, localSymbol, $('#symbol-color-input').val(), $("#symbol-size-input").val(), 'serif');
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
                , 'width': $("#thickness-input").val()
                , });
            drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val(), $("#thickness-input").val());
        }
        active = false;
    });

    canvas.bind('mouseleave', function (e) {
        active = false;
    });

    canvas.on('mousemove', function (e) {
        var colorUsed;

        if(currentTool == "paintbrush" || currentTool == "pencil"){
            colorUsed = $("#color-input").val()
        }

        if (currentTool != "text" && currentTool != "line" && currentTool != "import"){
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
                drawLine(prev.x, prev.y, e.pageX, e.pageY, $("#color-input").val(), 1);//,$("#thickness-input").val());
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

    var lineStack = new Array();
    var previousText = $('#text-input').val();
    var previousTextSize = 0;//parseInt(ctx.font);
    $('#text-input').keyup(function(e){
        if (currentTool == "text"){
            var fontSel = document.getElementById('font-picker');
            var fontSelValue = fontSel.options[fontSel.selectedIndex];
            var sizeInputVal = Number($("#size-input").val());
            if (e.which != 13){
                if (e.which != 8 || (previousText != "")){
                    socket.emit('tool', {
                        'y': nav_height+sizeInputVal
                        , 'action' : currentTool
                        , 'drawing': true
                        , 'textValue': $('#text-input').val()
                        , 'color': $("#color-input").val()
                        , 'size' :  $("#size-input").val()
                        , 'font' : fontSelValue.text
                        , 'previousText' : previousText
                        , 'previousTextSize' : previousTextSize
                        , 'parsedSize' : parseInt(ctx.font)
                        , });
                    ctx.clearRect(10, previousTextSize, ctx.measureText(previousText).width, previousTextSize + parseInt(ctx.font));
                    placeText(10, nav_height + sizeInputVal + previousTextSize, $('#text-input').val(), $("#color-input").val(), $("#size-input").val(), fontSelValue.text);
                    previousText = $('#text-input').val();   
                } else {
                    previousTextSize = previousTextSize - parseInt(ctx.font);
                    document.getElementById('text-input').value = lineStack.pop();
                }
            } else {
                    previousTextSize = previousTextSize + parseInt(ctx.font);
                    lineStack.push($('#text-input').val());
                    document.getElementById('text-input').value = "";
            }
        }
    });

    function drawLine(fromx, fromy, tox, toy, color, width){
        ctx.beginPath();
        ctx.moveTo(fromx, fromy - nav_height);
        ctx.lineTo(tox, toy - nav_height);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.closePath();
    }

    function drawCircle(x,y,radius,color){
        ctx.beginPath();
        ctx.arc(x,y-nav_height,radius,0,2*Math.PI,true);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
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
        size = size.concat("pt ");
        size = size.concat(font);
        ctx.font = size;
        ctx.fillStyle = color;
        ctx.fillText(textInputVal, x, y - nav_height);
    }

    function saveCanvas(){
        var image;
        image = canvas.get(0).toDataURL('image/png');
        socket.emit('save_canvas',{imagedata:image});
    }

    function importImg(input) {
        if (input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                img = document.createElement("img");
                img.innerHTML = '<img src="#" alt="Imported image" width="220" height="277"/>';
                img.id = 'importImg';
                img.src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    function drawSaveData(base64,callback){

        var image = new Image();
        image.src=base64;
        image.onload = function(){
            ctx.drawImage(image,0,0);
            callback();
        }
        
    }

    $("#imgUpload").change(function () {
        importImg(this);
    });

    function clearCanvas(){
        ctx.clearRect(0,0,1920,1080);
        socket.emit('tool', {
            'action' : "clear"
            , 'drawing': true
        });
    }

        nav_height = $('nav').outerHeight();
        $('.slide-panel').css("height", "calc(100% - " + nav_height + "px)");
        $('#chat-badge').css("top",(nav_height + 2) + "px");
        $(".btn").click(function () {
            if ($(this).val() == "pencil") {
                currentTool = "pencil";
                setButtonsDefault()
                $(".color-picker").css("visibility", "visible");
            }
            if ($(this).val() == "paintbrush") {
                currentTool = "paintbrush";
                setButtonsDefault()
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "visible");
            }
            if ($(this).val() == "eraser") {
                currentTool = "eraser";
                setButtonsDefault()
                $(".thickness-picker").css("visibility", "visible");
            }
            if ($(this).val() == "text") {
                currentTool = "text";
                setButtonsDefault()
                $(".color-picker").css("visibility", "visible");
                $(".size-picker").css("visibility", "visible");
                $("#size-input").attr("placeholder", "");
                $(".text-picker").css("visibility", "visible");
                $("#font-picker").css("visibility", "visible");
            }
        });

        $('.symbol').click(function(){
            symbol = $(this).text();
        });

        $("#drop li a").click(function() {
            if ($(this).children().html() == " Line Tool"){
                currentTool = "line";
                setButtonsDefault()
                $(".color-picker").css("visibility", "visible");
                $(".thickness-picker").css("visibility", "visible");
            }
            if ($(this).children().html() == " Import Image"){
                currentTool = "import";
                setButtonsDefault();
                $(".size-picker").css("visibility", "visible");
                $("#size-input").attr("placeholder", "Enter width height");
                $("#imgUploadLbl").css("visibility", "visible");
            }
            if ($(this).children().html() == " Move Tool"){
                currentTool = "move";
            }
            if ($(this).children().html() == " Symbol Tool"){
                currentTool = "symbol";
                $(".standard-tool-menu").css("display", "none");
                $(".symbol-tool-menu").css("display", "inline");
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
        $('#export').click(function(){
            this.href = canvas[0].toDataURL();
            this.download = "whiteboard.png";
        })
        $("#clear").click(function(){
            clearCanvas();
        });
        $("#invite").click(function(){
            socket.emit("get_invite_key");
        });
            
        socket.on("rec_invite_key",function(key){
            $('#invite-key').html(key);
            $('#invite-modal').modal('show');
        });
        setButtonsDefault();

});
// chat panel javascript
function setButtonsDefault()
{
    $(".standard-tool-menu").css("display", "inline");
    $(".symbol-tool-menu").css("display", "none");
    $(".color-picker").css("visibility", "hidden");
    $(".thickness-picker").css("visibility", "hidden");
    $(".size-picker").css("visibility", "hidden");
    $(".text-picker").css("visibility", "hidden");
    $("#font-picker").css("visibility", "hidden");
    $("#imgUploadLbl").css("visibility", "hidden");
}
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
