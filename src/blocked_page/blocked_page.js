// Wait for the window to load.
window.onload = function() {
	var go_back_link = document.getElementById("go-back");
	var unblacklist_link = document.getElementById("unblacklist")

	go_back_link.onclick = function() {
		console.log("hullu!");
		return false;
	}

	unblacklist_link.onclick = function() {
		console.log("hollo!");
		return false;
	}
}