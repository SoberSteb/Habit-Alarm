// Took some handy pointers from the following link:
//  https://dev.to/christiankaindl/a-webextension-guide-36ag

// Listen for messages.
browser.runtime.onMessage.addListener(handleMessage);

console.log("yippee");

// Handle the received messages.
function handleMessage() {
  console.log("hmm...");
}
