// Took some handy pointers from the following link:
//  https://dev.to/christiankaindl/a-webextension-guide-36ag

var global_time_left = 0;

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

  // And finally, start the timer again.
  setTimeout(tickFunction, 1000);
}
