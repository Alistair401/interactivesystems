var attempt = 3; // Variable to count number of attempts.
// Below function Executes on click of login button.
function validate(){
	var modal = document.getElementById('myModal');
	if(modal.style.display == "block"){
		var username = document.getElementById("username1").value;
		var password = document.getElementById("password1").value;
		}else{
		var username = document.getElementById("username").value;
		var password = document.getElementById("password").value;
		}
	if ( username == "TeamF" && password == "TeamF#123"){
		alert ("Login successfully");
		window.location = "success.html"; // Redirecting to other page.
		return false;
	}
	else{
		attempt --;// Decrementing by one.
		alert(username+" "+password);
		// Disabling fields after 3 attempts.
		if( attempt == 0){
			document.getElementById("username").disabled = true;
			document.getElementById("password").disabled = true;
			document.getElementById("submit").disabled = true;
			return false;
		}
	}
}


function modal() {
	var modal = document.getElementById('myModal');
	modal.style.display = "block";
}

window.onclick = function(event) {
var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
   }
 }