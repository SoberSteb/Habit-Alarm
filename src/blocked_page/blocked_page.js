// Wait for the window to load.
window.onload = function() {
	var go_back_link = document.getElementById("go-back");
	var unblacklist_link = document.getElementById("unblacklist")

	// If the user wants to go back after giving themselves more time, look into the history
	// of the current tab and go back by one.
	go_back_link.onclick = function() {
		window.history.back();
		return false;
	}

	unblacklist_link.onclick = function() {
		var tab_history = window.history;

		return false;
	}
}