document.body.style.border = "5px solid blue";




function notifyExtension(e) {
    var target = e.target;
    while ((target.tagName != "A" || !target.href) && target.parentNode) {
        target = target.parentNode;
    }
    if (target.tagName != "A")
        return;

    console.log("content script sending message");
    browser.runtime.sendMessage({"url": target.href});
}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("click", notifyExtension);

//
// var myPort = browser.runtime.connect({name:"port-from-cs"});
// myPort.postMessage({greeting: "hello from content script"});
//
// myPort.onMessage.addListener(function(m) {
//     console.log("In content script, received message from background script: ");
//     console.log(m.greeting);
// });
//
// document.body.addEventListener("click", function() {
//     myPort.postMessage({greeting: "they clicked the page!"});
// });