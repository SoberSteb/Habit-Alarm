// Took some handy pointers from the following link:
//  https://dev.to/christiankaindl/a-webextension-guide-36ag

var global_time_left = 0;
var global_blacklist = [];

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
// Start a timer that executes every second. This will take away a second...every second.
// TODO: Make sure that the timer doesn't start if the time is 0.
// That is, make sure that after the user adds <x> amount of time, it doesn't go from
// 15:00 -> 14:59 in less than a second.
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

	console.log(global_blacklist);

	// If there is no website blacklist yet, set it equal to a certain website. (TODO: Debug, get rid of this once loading/storing website names works)
	if(global_blacklist == null || global_blacklist.length === 0) {
		global_blacklist = ["musicforprogramming.net/?twentyone"];
	}
}

/*
 * =============================================================
 * Start the main loop for updating time and acting accordingly.
 * =============================================================
 */
function tickFunction() {
	console.log("main tick global time left: " + global_time_left);
	// Take away a second off of global_time_left.
	global_time_left--;
	// Make sure it doesn't go to the negatives.
	if(global_time_left < 0) {
		global_time_left = 0;
	}

	// If there's no more time left, hide the contents of the page.
	// Otherwise, show the contents again.
	if(global_time_left <= 0) {
		browser.tabs.query({active: true, currentWindow: true})
			.then(hidePage)
			.catch(reportError);
	} else {
		browser.tabs.query({active: true, currentWindow: true})
			.then(showPage)
			.catch(reportError);
	}

	// And finally, start the timer again.
	setTimeout(tickFunction, 1000);
}

/*
 * If an error occurs preventing the addon from loading, log the error to the console.
 */
function reportError(error) {
	console.error(`Could not hide page for productivity: ${error}`);
}

/*
 * Insert the page-hiding CSS into the active tab.
 */
function hidePage(tabs) {
	browser.tabs.insertCSS({code: CSS_hidePage});
}

/*
 * Remove the page-hiding CSS from the active tab.
 */
function showPage(tabs) {
	browser.tabs.removeCSS({code: CSS_hidePage});
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
