// Initialize global variables.
var timeContainer = document.querySelector('.time-container')
var addBtn = document.querySelector('.add');

var time_left = 0;

// Add event listeners to buttons.
addBtn.addEventListener('click', addTime);

function addTime() {
  // Add the time to the total amount of time left.
  time_left += 15;

  // Update the total amount of time.
  document.querySelector('.timer').innerHTML = "Time left: " + time_left + " minutes.";
}
