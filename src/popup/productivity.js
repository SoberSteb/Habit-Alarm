// Initialize global variables.
var timeContainer = document.querySelector('.time-container')
var addBtn = document.querySelector('.add');

// Add event listeners to buttons.
addBtn.addEventListener('click', addTime);

updateDisplay(); // Just to overwrite anything that the button says.

// Start the main loop. The main loop function is at the bottom of the script.
setTimeout(mainLoop, 1/30);

/*
 * Get Time From Background (GTFB).
 * Basically, it reaches into the extension window and grabs the global variable global_time_left.
 * Yes, I know that global variables are a bad practice. But when I was trying sending and receiving
 * messages from the popup js to the background js, I was at a complete loss. This is much easier to
 * execute. I do know that using global variables can be circumvented by using local storage, buuuut...
 * I needed to accomplish this first.
 */
function GTFB() {
  return browser.extension.getBackgroundPage().global_time_left;
}

/*
 * Set Global Time (SGT).
 * Sets the global time from the background script.
 */
function SGT(time) {
  // If the input time is negative for whatever reason, make it 0.
  if(time < 0) {
    time = 0;
  }

  browser.extension.getBackgroundPage().global_time_left = time;
}

function updateDisplay() {
  // Update the total amount of time.
  document.querySelector('.timer').innerHTML = "Time left: " + formatTime() + ".";
}

function addTime() {
  // Get the time from the background script and assign it a variable.
  var time_left = GTFB();
  // Add the time to the total amount of time left.
  time_left += 15 * 60; // * 60 because we want 15 minutes in seconds.
  // Set the time to the global time.
  SGT(time_left);

  // Update the display.
  updateDisplay();
}

/*
 * Take any number of seconds and spit out how many minutes and seconds the user has
 * left to browse.
 */
function formatTime() {
  // Get the time from the background script and assign it a variable.
  var time = GTFB();

  // Figure out how many hours, minutes, and seconds there are in the given time.
  // Code shameleslly "inspired" from:
  //  https://stackoverflow.com/questions/26794703/swift-integer-conversion-to-hours-minutes-seconds
  // I added the Math.floor() function to all of them as it would be a bit weird without it.
  //  For example, if there were only 30 minutes, then it would display: "0.5 H 30 M 0 S".
  var hours = Math.floor(time / 3600);
  var minutes = Math.floor((time % 3600) / 60);
  var seconds = Math.floor((time % 3600) % 60);

  // Return a string including these numbers.
  return (hours + " H " + minutes + " M " + seconds + " S");
}

/*
 * Run the popup at 30 fps.
 */
function mainLoop() {
  // Update the display to accurately reflect the seconds remaining.
  updateDisplay();

  // Repeat the loop.
  setTimeout(mainLoop, 1/30);
}
