document.body.style.border = "5px solid blue";


function notifyExtension(e) {

    var urls = [];
    for(var i = document.links.length; i --> 0;)
        urls.push(document.links[i].href);
    browser.runtime.sendMessage(urls);

}

function perf() {
    console.log("PERF IS BEING CALLED")
    var urls = [];
    for(var i = document.links.length; i --> 0;)
        //if (document.links[i].hostname === location.hostname)
            urls.push(document.links[i].href);
    console.log(JSON.stringify(urls))

    site_data = {}

    var i;
    for (i = 0; i < min(2, urls.length); i++) {
        console.log("going for " + i);
        site_data[urls[i]] = getPageData(urls[i]);
    }

}

function min(a, b) {
    if (a < b) {
        return a
    }
    return b
}

function getPageData(website) {
    console.log("opening")
    var temp = window.open(website)
}

function getPerfDataOnPage() {
    console.log("HERE");
    console.log(JSON.stringify(window.performance.getEntriesByType("navigation")));

    // TODO(bill) log with storage api for comparison with prefetch on/off
    perfData = window.performance.getEntriesByType("navigation");

    name = perfData[0]["name"]
    if (name) {
        var obj = {};
        obj[name] = JSON.stringify(perfData[0]);

        // Log in local storage, with website name as key
        // Value is stringified performance timing data.
        browser.storage.local.set(obj).then(logOkay, onError)
    } else {
        console.log("failure, name is " + name)
    }

}

function logOkay() {
    console.log("successfully logged a site")
}

function onError(error) {
    console.log(JSON.stringify(error))
}


/*
Add notifyExtension() as a listener to click events.
*/
// window.addEventListener("load", getPerfDataOnPage);

window.addEventListener("load", function() { // IE9+
    setTimeout(getPerfDataOnPage, 5000); // 0, since we just want it to defer.
});

// click triggers the opening and timing of pages linked to by current page.
window.addEventListener("click", perf)