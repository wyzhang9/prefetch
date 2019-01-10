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
    for (i = 0; i < 5; i++) {
        console.log("going for " + i);
        site_data[urls[i]] = getPageData(urls[i]);
    }

}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function getPageData(website) {
    console.log("opening")

    var temp = window.open(website)
    //temp.addEventListener("load", getPerfDataOnPage); // 0, since we just want it to defer.
    console.log("opened and now waiting")
    // wait(5000)
}

function getPerfDataOnPage() {
    console.log("HERE");
    //Check if the browser supports the timing APIs
    console.log(JSON.stringify(window.performance.getEntriesByType("navigation")));
}

/*
Add notifyExtension() as a listener to click events.
*/
// window.addEventListener("load", getPerfDataOnPage);

window.addEventListener("load", function() { // IE9+
    setTimeout(getPerfDataOnPage, 0); // 0, since we just want it to defer.
});

window.addEventListener("click", perf)