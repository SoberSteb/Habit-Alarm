// Took some handy pointers from the following link:
//  https://dev.to/christiankaindl/a-webextension-guide-36ag

var global_time_left = 0;

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
// Start a timer that executes every second. This will take away a second...every second.
// TODO: Make sure that the timer doesn't start if the time is 0.
// That is, make sure that after the user adds <x> amount of time, it doesn't go from
// 15:00 -> 14:59 in less than a second.
setTimeout(tickFunction, 1000);
// Store the remaining amount of time in 30 second increments.
setTimeout(saveFunction, 30000);

/*
 * Load the local time if it exists.
 */
function loadRemainingTime() {
}

function tickFunction() {
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
}
