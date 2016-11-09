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
	var drawing = false;

	var socket = io();

	socket.on('moving', function (data) {
		if(data.drawing){
			drawLine(data.prev_x, data.prev_y, data.x, data.y, data.color);
		}
	});

	var prev = {};
	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;
	});

	canvas.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	canvas.on('mousemove',function(e){
			socket.emit('mousemove',{
				'prev_x': prev.x,
				'prev_y': prev.y,
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
                'color': $(".color-picker").val(),
			});

		if(drawing){
			drawLine(prev.x, prev.y-64, e.pageX, e.pageY-64, $(".color-picker").val());
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

	function drawLine(fromx, fromy, tox, toy, color){
        ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
        ctx.strokeStyle = color;
		ctx.stroke();
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
            $(".tool-menu").html("Colour:   <input class='color-picker' type='color'>");
    })
});
