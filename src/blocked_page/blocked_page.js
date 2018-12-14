var global_bg_script = browser.extension.getBackgroundPage(); // Get the background script.
// Grab the previous url stored within the background script and, after grabbing it, set it to nothing.
var previous_url = global_bg_script.global_prev_url;
global_bg_script.global_prev_url = "";

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
		var trimmed_url = trimURL(previous_url);

		var unblacklist_url = true;
		// Now that the domain name is isolated, make sure that it's in the blacklist so that it can be popped.
		if(!global_bg_script.checkBlacklistMatch(trimmed_tab_url)) {
			unblacklist_url = false;
		}

		if(unblacklist_url) {
			console.log("unblacklisting with url " + trimmed_url);
			// Splice the url from the blacklist.
			global_bg_script.global_blacklist.splice(global_bg_script.global_blacklist.indexOf(trimmed_url), 1);

			// Save the blacklist.
			global_bg_script.saveWebsiteLists();
		}

		window.history.back();

		return false;
	}

	// TODO: Move function to background script for less redundancy?
	function trimURL(tab_url) {
		// Split the string every time / occurs.
		var split_string = tab_url.split("/");
		// Check if the first element of the array contains http: or https:.
		// If it does, the domain is in the third element. (second in the array)
		// If it doesn't, the domain is in the first element. (zeroth in the array)
		if(split_string[0] === "http:" || split_string[0] === "https:") {
			trimmed_tab_url = split_string[2];	
		} else {
			trimmed_tab_url = split_string[0];
		}
	
		return trimmed_tab_url;
	}
}