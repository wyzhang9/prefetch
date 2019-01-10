function resolved(record) {
    console.log("Resolved Record: ")
    console.log(record.canonicalName);
    console.log(record.addresses);
}


/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message) {
    console.log("background script received message");

    console.log("urls: " + JSON.stringify(message));

    console.log("trying to resolve urls")
    for (var i = 0; i < message.length; i++) {
        var url = new URL(message[i]);
        console.log("url hostname:" + url.hostname);
        let resolving = browser.dns.resolve(url.hostname, ["canonical_name"]);
        resolving.then(resolved);
    }
    console.log("resolving in background")
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(notify);