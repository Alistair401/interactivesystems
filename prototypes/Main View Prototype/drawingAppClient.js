var currentTool = null;

$(function(){
	// This demo depends on the canvas element
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}

	var doc = $(document),
		win = $(window),
		canvas = $('#main-canvas'),
		ctx = canvas[0].getContext('2d');

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	// A flag for drawing activity
	var active = false;

	var socket = io();

	socket.on('moving', function (data) {
		if(data.drawing){
			drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);
		}
	});
   	socket.on('eraser', function(data) {
		if(data.erasing){
			eraseAt(data.x, data.y, data.thickness);
		}
	});

	var prev = {};
	canvas.on('mousedown',function(e){
		e.preventDefault();
		active = true;
		prev.x = e.pageX;
		prev.y = e.pageY;
	});

	canvas.bind('mouseup mouseleave',function(){
		active = false;
	});

	canvas.on('mousemove',function(e){
        if (currentTool == "pencil")
        {
			socket.emit('pencil',{
				'prev_x': prev.x,
				'prev_y': prev.y,
				'x': e.pageX,
				'y': e.pageY,
				'drawing': active,
                'color': $(".color-picker").val(),
			});
        }
        if (currentTool == "eraser")
        {
            socket.emit('eraser',{
                'x': e.pageX,
                'y': e.pageY,
                'erasing': active,
                'thickness': $(".thickness").val(),
            })
        }

		if(active){
            switch (currentTool)
            {
                case "pencil":
    			    drawLine(prev.x, prev.y-64, e.pageX, e.pageY-64, $(".color-picker").val());
    			    prev.x = e.pageX;
    			    prev.y = e.pageY;
                    break;
                case "eraser":
                    eraseAt(e.pageX, e.pageY-64, $(".thickness").val());
                    break;
            }
		}
	});

	function drawLine(fromx, fromy, tox, toy, color){
        ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
        ctx.strokeStyle = color;
		ctx.stroke();
	}
    function eraseAt(x, y, thickness)
    {
        ctx.beginPath();
        ctx.clearRect(x-(thickness/2), y-64-(thickness/2), thickness, thickness);
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
  } else {
    document.getElementById("chat-panel").style.width = "15px";
    chat_open = false;
  }
}
$(document).ready(function(){
    $(".btn").click(function() {
        if ($(this).val() == "pencil")
        {
            currentTool = "pencil";
            $(".tool-menu").html("Colour:   <input class='color-picker' type='color'>");
        }
        if ($(this).val() == "eraser")
        {
            currentTool = "eraser";
            $(".tool-menu").html("Thickness: <input class='thickness' min=1 max=50 type='range'>");
        }
    })
});
