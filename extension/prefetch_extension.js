document.body.style.border = "5px solid blue";


function notifyExtension(e) {
    var urls = [];
    for(var i = document.links.length; i --> 0;)
       //  if(document.links[i].hostname === location.hostname)
            urls.push(document.links[i].href);
    // browser.runtime.sendMessage(urls);

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
    for (i = 0; i < min(10, urls.length); i++) {
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