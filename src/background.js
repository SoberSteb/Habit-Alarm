// Took some handy pointers from the following link:
//  https://dev.to/christiankaindl/a-webextension-guide-36ag

var global_time_left = 0;
var global_blacklist = [];
var global_prev_url = "";
// Set up variables to specify when badge colors should trigger.
var trigger_red_badge_time = 5 * 60;
var trigger_yellow_badge_time = 10 * 60;

/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 *
 * Shamelessly stolen from the "beastify" addon from Firefox.
 */
const CSS_hidePage = `body > :not(.placeholder) {
                        display: none;
					 }`;

// Load from local storage.
loadRemainingTime();
loadWebsiteLists();
// Start a timer that executes every second.
// setInterval is NOT used as the addon would start using a lot more CPU (from ~1% to 5% on my CPU)
setTimeout(tickFunction, 1000);
// Store the remaining amount of time in 30 second increments.
setTimeout(saveFunction, 30000);

function onError(error) {
	console.log(error);
}

/*
 * Load the local time.
 */
function loadRemainingTime() {
	var getting_time = browser.storage.local.get("time_object");

	getting_time.then(onTimeRetrieval, onError);
}

/*
 * Handle the retrieved time from the local storage.
 */
function onTimeRetrieval(storage) {
	// Retreive the local storage and set global time equal to
	// the stored value.
	global_time_left = storage.time_object.time_left;

	// If global_time_left is NaN, the file doesn't exist.
	// In that case, simply reset global_time_left to 0.
	if(isNaN(parseFloat(global_time_left))) {
		global_time_left = 0;
	}
}

/*
 * Load the list of websites.
 */
function loadWebsiteLists() {
	var blacklist = browser.storage.local.get("website_object");

	blacklist.then(onWebsiteListRetrieval, onError);
}

/*
 * Handle the retrieved lists from the local storage.
 */
function onWebsiteListRetrieval(storage) {
	global_blacklist = storage.website_object.blacklist;
}

/*
 * =============================================================
 * Start the main loop for updating time and acting accordingly.
 * =============================================================
 */
function tickFunction(tabs) {
	browser.tabs.query({currentWindow: true, active: true}).then(decrementTime, onError);

	// If there's no more time left, block the page.
	if(global_time_left <= 1) {
		browser.tabs.query({currentWindow: true, active: true}).then(blockTab, onError);
	}

	// Start the timer again.
	setTimeout(tickFunction, 1000);
}

/*
 * If an error occurs preventing the addon from loading, log the error to the console.
 */
function reportError(error) {
	console.error(`Could not hide page for productivity: ${error}`);
}

function decrementTime(tabs) {
	var tab_url = tabs[0].url;
	var tab_is_in_blacklist = checkBlacklistMatch(tab_url);

	// Take away a second off of global_time_left if the website is in the blacklist.
	if(tab_is_in_blacklist) {
		global_time_left--;
	
		// Make sure it doesn't go to the negatives.
		if(global_time_left < 0) {
			global_time_left = 0;
		}

		updateBadge();
	} else {
		// Since the website isn't in the blacklist, hide the badge text.
		browser.browserAction.setBadgeText({text: ""});
	}
}

/*
 * Insert the page-hiding CSS into the active tab.
 */
function hidePage(tabs) {
	/*
	 * Take note of the current url. This will be put in a global variable which will be accessed
	 * by the blocked page's javascript function. After the page's javascript function retrieves
	 * the previous url stored in the global variable, it will then set the global variable
	 * to be "".
	 */
	global_prev_url = tabs[0].url; // Grab the current url.

	// Redirect the user to a page telling them that their content is blocked.
	browser.tabs.update(tabs[0].id, {
		active: true,
		url: "/blocked_page/blocked_page.html"
	});
}

/*
 * Block the current tab if the domain is listed in the blacklist.
 */
function blockTab(tabs) {
	// Grab the current url.
	var tab_url = tabs[0].url;

	// Check if the current URL matches any URLS within the global_blacklist.
	var tab_is_in_blacklist = checkBlacklistMatch(tab_url);
	
	// If the tab url is in the blacklist, block the tab.
	if(tab_is_in_blacklist) {
		browser.tabs.query({active: true, currentWindow: true})
			.then(hidePage)
			.catch(reportError);
	}
}

/*
 * Check if a given URL is in the blacklist.
 */
function checkBlacklistMatch(tab_url) {
	var trimmed_tab_url;

	// Get the domain out of the current tab_url.
	
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

	var is_matching = false;
	
	// Check if trimmed_tab_url is within any url in global_blacklist.
	for(var i=0; i<global_blacklist.length; i++) {
		if(global_blacklist[i].includes(trimmed_tab_url)) {
			is_matching = true;
		}
	}

	// Return that the website is found in the global_blacklist array.
	return is_matching;
}

/*
 * Save the remaining time locally.
 */
function saveFunction() {
	var time_object = {
		time_left: global_time_left
	}

	// Store the time as "Time" locally.
	/*
	 * I figured out why I couldn't quite pass the objects into the
	 * local storage! It's simply due to some quirk of javascript
	 * that I really don't quite know about.
	 *
	 * Basically, in this case, you want to surround the object within
	 * { }. Doing this will actually pass in the object.
	 */
	var storing_time = browser.storage.local.set({time_object});

	storing_time.then(() => {
		// Do nothing here.
		// Just leaving this here just in case there's ever an error.
	}, onError);

	setTimeout(saveFunction, 30000);
}

/*
 * Save the website lists.
 */
function saveWebsiteLists() {
	var website_object = {
		blacklist: global_blacklist
	}

	// Store the website_object into local storage.
	var storing_lists = browser.storage.local.set({website_object});

	storing_lists.then(() => {
		// Nothing here, just doing a then for the errors.
	}, onError);
}

/*
 * Updates the time to be displayed in the badge and the badge background color.
 */
function updateBadge() {
	// Format the time into 4 characters or less for the badge.
	var badge_text = getTimeBadgeFormat();
	browser.browserAction.setBadgeText({text: badge_text});

	// Update the color of the badge depending on the amount of remaining time.
	if(global_time_left <= trigger_red_badge_time) {
		browser.browserAction.setBadgeBackgroundColor({color: "red"});
	} else if(global_time_left <= trigger_yellow_badge_time) {
		browser.browserAction.setBadgeBackgroundColor({color: "yellow"});
	} else {
		browser.browserAction.setBadgeBackgroundColor({color: "black"});
	}
}

function getTimeBadgeFormat() {
	// If the number of hours is above 99, indicate that it is so.
	if(global_time_left / 3600 >= 100) {
		return ">99h";
	} else
	// See if the time is one hour or greater. If it is, display the hours.
	if(global_time_left / 3600 >= 1) {
		return Math.floor(global_time_left / 3600) + "h";
	} else
	// If the time is more than a minute, display the minutes.
	if(global_time_left / 60 >= 1) {
		return Math.floor(global_time_left / 60) + "m";
	} else
	// If the time is more than a second, display the seconds.
	if(global_time_left >= 1) {
		return global_time_left + "s";
	// Don't display anything if there is no time left.
	} else {
		return "";
	}
}
