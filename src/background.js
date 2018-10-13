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

// Start a timer that executes every second. This will take away a second...every second.
// TODO: Make sure that the timer doesn't start if the time is 0.
setTimeout(tickFunction, 1000);

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
	}

  // And finally, start the timer again.
  setTimeout(tickFunction, 1000);
}

/**
 * Just log the error to the console.
 */
	function reportError(error) {
		console.error(`Could not hide page for productivity: ${error}`);
	}

/**
 * Insert the page-hiding CSS into the active tab,
 * then get the beast URL and
 * send a "beastify" message to the content script in the active tab.
 */
function hidePage(tabs) {
	// TODO: Move the inserting of the CSS code into a CONTENT script, since
	// background scripts CANNOT access page elements by default.
	// First, hide the contents of the current webpage.
	browser.tabs.insertCSS({code: CSS_hidePage}).then(() => {
		var test = 1;
	});
}
