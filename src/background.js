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
const CSS_hidePage = `body > :not(.beastify-image) {
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
 * Handle the retrieved time from the local storage.
 */
function onTimeRetrieval(time_retrieved) {
	// Retreive the local storage and set global time equal to
	// the stored value.
	global_time_left = time_retrieved.time_left;

	// If global_time_left is NaN, the file doesn't exist.
	// In that case, simply reset global_time_left to 0.
	if(isNaN(parseFloat(global_time_left))) {
		global_time_left = 0;
	}
}

/*
 * Load the local time if it exists.
 */
function loadRemainingTime() {
	var getting_time = browser.storage.local.get("time_left");

	getting_time.then(onTimeRetrieval, onError);
}

function onWebsiteListRetrieval(lists_retrieved) {
	global_blacklist = lists_retrieved.blacklist;

	// If there is no website blacklist yet, set it equal to a certain website. (TODO: Debug, get rid of this once loading/storing website names works)
	if(global_blacklist == null || global_blacklist.length === 0) {
		global_blacklist = ["musicforprogramming.net/?twentyone"];
	}
}

function loadWebsiteLists() {
	var blacklist = browser.storage.local.get("blacklist");

	blacklist.then(onWebsiteListRetrieval, onError);
}

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
 * Just log the error to the console.
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
	// Taking a look at this after some time passed:
	//   I have no idea why saving as an object and then looking for
	//   some storage identified by one of the object's dictionary
	//   values works. I'm leaving this as is.
	var storing_time = browser.storage.local.set(time_object);

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

	// TODO: Figure out how exactly to store multiple values into a single object that can be retrieved later. This is driving me nuts.
	var storing_lists = browser.storage.local.set(website_object);

	storing_lists.then(() => {
		// Nothing here, just doing a then for the errors.
	}, onError);
}
