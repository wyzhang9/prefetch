function resolved(record) {
    console.log("Resolved Record: ")
    console.log(record.canonicalName);
    console.log(record.addresses);
}


// Sites visited so far + number of times visited..
var visitedSites = {}
var visitedSiteSize = 0;

/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message, sender, sendResponse) {
    console.log("background script received message");

    // currently emssage is just a single url/html link..
    //var obj = JSON.parse(message);

    console.log("message: " + JSON.stringify(message));

    if (message.func === "notify") {
        console.log("continue in notify");
    }

    var url = message.url;

    var tabId = browser.tabs.getCurrent();

    console.log("adding to the hashmap");
    if (url in visitedSites) {
        visitedSites[url] = visitedSites[url] + 1;
    } else {
        visitedSites[url] = 1;
        visitedSiteSize++;
    }

    console.log("visitedSites: " + JSON.stringify(visitedSites));
    console.log("visitedSiteSize: " + visitedSiteSize)
    sendResponse({
        count:visitedSites[url], 
        thisUrl: url,
        numSitesSeen: visitedSiteSize,
        numUrlonPage: message.numUrlOnPage
    });

    //console.log("urls: " + JSON.stringify(message));

    // console.log("retrieving unique host names");
    // // Retaining only unique hostnames
    // var hostNames = []; // Array of hostnames
    // for (var i = 0; i < message.length; i++) {
    //     var url = new URL(message[i]);
    //     hostNames.push(url.hostname);
    // }

    // //Retaining only unique host names to resolve
    // var uniqueHostNames = [...new Set(hostNames)]

    // console.log("unique host names: " + JSON.stringify(uniqueHostNames));

    // console.log("trying to resolve host names")
    // for (var i = 0; i < uniqueHostNames.length; i++) {
    //     console.log("url hostname:" + uniqueHostNames[i]);
    //     let resolving = browser.dns.resolve(uniqueHostNames[i], ["canonical_name"]);
    //     resolving.then(resolved);
    // }
    // console.log("resolving in background")

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

    // holds data in the format { [site name]_[index] : performanceData}
    var data = {};
    // key: site name, value: number of occurrences
    var counts = {};
    // hash set of site urls.
    var sites = new Set();


    // populate data variable using data retrieved from local storage
    for (var key in item) {
        // remove random numbers that were added to deduplicate keys
        var trimmedIndex = key.indexOf("_");
        var trimmedKey = key.substring(trimmedIndex + 1);

        var count = 1;
        if (trimmedKey in counts) {
            count = counts[trimmedKey] + 1;
        }
        data[trimmedKey + "_" + count] = item[key]
        counts[trimmedKey] = count

        sites.add(trimmedKey)
    }

    // compare before and after
    console.log("Now comparing before and after")
    var arr_sites = Array.from(sites)
    for (var i = 0; i < arr_sites.length; i++) {

        var key = arr_sites[i]
        if (!key.startsWith("PREFETCHON_")) {
            var prefetch_off_time = getAverageLoadTime(data, key, counts[key])
            var prefetch_on_time = getAverageLoadTime(data, "PREFETCHON_"+key, counts["PREFETCHON_"+key])

            console.log("prefetch on, time for " + key + " on average is " + prefetch_on_time)
            console.log("prefetch off, time on average is " + prefetch_off_time)
        }
    }
}

// Given a set of data, a key to compare, averages the [count] occurrences
// of key's load time
function getAverageLoadTime(data, key, count) {
    var sum = 0;

    for (var i = 1; i <= count; i++) {
        var index = key+"_"+count;

        //console.log("attempting to parse?  " + index )
        if (index in data) {
            var temp = JSON.parse(data[index]);
            var end = parseInt(temp["loadEventEnd"])
            var start = parseInt(temp["redirectStart"])
            sum += end - start;
        }
    }
    console.log("sum is " + sum + " avg is " + (sum/count))
    return sum/count;
}

function onError(error) {
    console.log(JSON.stringify(error))
}


/*
Assign `notify()` as a listener to messages from the content script.
*/
browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.func === "notify") {
            notify(request, sender, sendResponse)
            return true;
        }
    });

// Adds a listener to when our extension button is clicked.
browser.browserAction.onClicked.addListener(summarizePerfData);
