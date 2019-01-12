document.body.style.border = "5px solid blue";
// TOGGLE THIS TO SAVE DATA WHEN PREFETCH IS ON OR OFF
var PREFETCH_ON = true;
var counter = 0;

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

    var i;
    var num_trials = 3;
    for (var i = 0; i < min(2, urls.length); i++) {
        // repeat each site visit num_trials times
        for (var j = 0; j < num_trials; j++) {
            // wait 3000 milliseconds between pages to avoid overlap.
            setTimeout(getPageData(urls[i]), 3000);
        }
    }
}

function min(a, b) {
    if (a < b) {
        return a
    }
    return b
}

function getPageData(website) {
    console.log("opening " + website)
    var temp = window.open(website)
}


function getPerfDataOnPage() {
    console.log("HERE ");
    //console.log(JSON.stringify(window.performance.getEntriesByType("navigation")));

    //
    var perfData = window.performance.getEntriesByType("navigation");

    var name = perfData[0]["name"]
    if (name) {
        var obj = {};
        if (PREFETCH_ON) {
            name = "PREFETCH_ON_" + name;
        }

        counter++;
        name = counter + "_" + name

        // maybe average this over multiple runs?
        console.log("logging " + name)
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