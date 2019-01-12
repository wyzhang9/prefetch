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

    // todo Compare the data for PREFETCH_ON_ and without PREFETCH_ON_
    for (var key in item) {
        // console.log("KEY IS " + key)
        if (!key.startsWith("PREFETCH_ON_")) {
            // console.log("i am here KEY IS " + key)
            var gettingItem = browser.storage.local.get([key, "PREFETCH_ON_"+key])
            gettingItem.then(doCompare, onError)
        }
    }
}

// sites just contains PREFETCH_ON_site and site
function doCompare(sites) {
    console.log("i am here2")

    //
    // // get the keys corresponding to PREFETCH_ON_ and off, and compare them
    var prefetch_on;
    var prefetch_off;
    for (var key in sites) {
        if (key.startsWith("PREFETCH_ON_")) {
            prefetch_on = sites[key]
        } else {
            prefetch_off = sites[key]
        }
    }

    console.log("SITEON " + JSON.stringify(prefetch_on ));
    console.log("SITEOFF " + JSON.stringify(prefetch_off ));
}

function onError(error) {
    console.log(JSON.stringify(error))
}


/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(notify);

// Adds a listener to when our extension button is clicked.
browser.browserAction.onClicked.addListener(summarizePerfData);
