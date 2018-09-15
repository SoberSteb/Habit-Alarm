// Initialize global variables.
var timeContainer = document.querySelector('.time-container')
var addBtn = document.querySelector('.add');

var time_left = 0; // In seconds.

// Add event listeners to buttons.
addBtn.addEventListener('click', addTime);

updateDisplay(); // Just to overwrite anything that the button says.

// Start a timer that executes every second. This will take away a second...every second.
// TODO: Make sure that the timer doesn't start if the time is 0.
setTimeout(tickFunction, 1000);

function tickFunction() {
  // Take away a second off of time_left.
  time_left--;
  // Make sure it doesn't go to the negatives.
  if(time_left < 0) {
    time_left = 0;
  }

  // debug
  var hey = 0;
  hey += browser.runtime.sendMessage({
    type: "updateTick"
  });

  console.log(hey);

  // Update the display.
  updateDisplay();

  // And finally, start the timer again.
  setTimeout(tickFunction, 1000);
}

function updateDisplay() {
  // Update the total amount of time.
  document.querySelector('.timer').innerHTML = "Time left: " + formatTime(time_left) + ".";
}

function addTime() {
  // Add the time to the total amount of time left.
  time_left += 15 * 60; // * 60 because we want 15 minutes in seconds.

  updateDisplay();
}

/*
 * Take any number of seconds and spit out how many minutes and seconds the user has
 * left to browse.
 */
function formatTime(time) {
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
