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

    console.log("retrieving unique host names");
    // Retaining only unique hostnames
    var hostNames = []; // Array of hostnames
    for (var i = 0; i < message.length; i++) {
        var url = new URL(message[i]);
        hostNames.push(url.hostname);
    }

    //Retaining only unique host names to resolve
    var uniqueHostNames = [...new Set(hostNames)]

    console.log("unique host names: " + JSON.stringify(uniqueHostNames));

    console.log("trying to resolve host names")
    for (var i = 0; i < uniqueHostNames.length; i++) {
        console.log("url hostname:" + uniqueHostNames[i]);
        let resolving = browser.dns.resolve(uniqueHostNames[i], ["canonical_name"]);
        resolving.then(resolved);
    }
    console.log("resolving in background")
}

/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(notify);
