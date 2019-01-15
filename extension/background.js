function resolved(record) {
    console.log("Resolved Record: ")
    console.log(record.canonicalName);
    console.log(record.addresses);
}


// Sites visited so far + number of times visited..
var visitedSites = []
var hostNames = []
var seenBefore;
/*
Log that we received the message.
Then display a notification. The notification contains the URL,
which we read from the message.
*/
function notify(message, sender, sendResponse) {
    console.log("background script received message");

    var currUrl = message.url;
    var originUrl = message.originUrl;

    console.log("visitedSites: " + JSON.stringify(visitedSites));

    // only proceed if origin url has not been seen before
    if (visitedSites.indexOf(originUrl) == -1 && 
        visitedSites.indexOf(currUrl) == -1) {
        var seenBefore = false;
        console.log("message: " + JSON.stringify(message));

        if (message.func === "notify") {
            console.log("continue in notify");
        }

        sendResponse({
            thisUrl: currUrl,
            seen: seenBefore
        });

        console.log("DNS resolution");
        var urlObj = new URL(message.url);
        if (!(urlObj.hostname in hostNames)) {
            hostNames.push(urlObj.hostname);
            browser.dns.resolve(urlObj.hostname, ["canonical_name"]);
        }

        console.log("Adding to the array");
        visitedSites.push(currUrl);
        console.log("visitedSiteSize: " + visitedSites.length);
    } else {
        seenBefore = true;

        sendResponse({
            thisUrl: currUrl,
            seen: seenBefore
        });
    }
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

        var prefetch_time = getAverageLoadTime(data,
            key, counts[key], "loadEventEnd", "unloadEventStart")

        console.log("prefetch on, time for " + key + " load on average is " + prefetch_time)

        var prefetch_inter = getAverageLoadTime(data,
            key, counts[key], "domInteractive", "unloadEventStart")

        console.log("prefetch on, time for " + key + " domInt on average is " + prefetch_inter)
    }
}

// Given a set of data, a key to compare, averages the [count] occurrences
// of key's load time
function getAverageLoadTime(data, key, count, endField, startField) {
    var sum = 0;

    for (var i = 1; i <= count; i++) {
        var index = key + "_" + i;

        //console.log("attempting to parse?  " + index )
        if (index in data) {
            var temp = JSON.parse(data[index]);
            var end = parseInt(temp[endField])
            var start = parseInt(temp[startField])
            sum += end - start;
        }
    }
    console.log("sum is " + sum + " avg is " + (sum / count))
    return sum / count;
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
