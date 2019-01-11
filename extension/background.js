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

// Read all data from local storage.
function summarizePerfData() {
    console.log("reading from storage")

    // If you pass null, or an undefined value, the entire storage contents will be retrieved.
    var gettingItem = browser.storage.local.get()
    gettingItem.then(onGot, onError)
}

// Called after successfully retrieving local browser storage 
function onGot(item) {
    console.log(JSON.stringify(item))
}

function onError(error) {
    console.log(JSON.stringify(error))
}


/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(notify);

// browser.runtime.onMessage.addListener(logPerfData);


// Adds a listener to when our extension button is clicked.
browser.browserAction.onClicked.addListener(summarizePerfData);