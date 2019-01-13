document.body.style.border = "5px solid blue";
// TOGGLE THIS TO SAVE DATA WHEN PREFETCH IS ON OR OFF
var PREFETCH_ON = true;
var windows = {} // ALLISON, THIS VARIABLE IS MINE, GO MAKE YOUR OWN

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
    var num_trials = 5;
    for (var i = 0; i < min(2, urls.length); i++) {
        // repeat each site visit num_trials times
        for (var j = 0; j < num_trials; j++) {
            // TODO don't forget to space out trials and reset cache between runs
            var website = urls[i]
            window.setTimeout(function() {
                console.log("opening " + website);
                openPage(website);

                // close the same window after 8 seconds?
                window.setTimeout(function() {
                    windows[website].close()
                    delete(windows[website])
                }, 8000)

            }, Math.floor(Math.random() * 50000));
        }
    }

    // close all remaining windows.
    window.setTimeout(closeAllWindows(windows), 120000)
}

function closeAllWindows(windows) {
    for (var key in windows) {
        if (windows.hasOwnProperty(key)) {
            windows[key].close()
        }
    }
}

function min(a, b) {
    if (a < b) {
        return a
    }
    return b
}

function openPage(website) {
    console.log("opening " + website)
    var temp = window.open(website)
    windows[website] = temp
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
            name = "PREFETCHON_" + name;
        }

        name = Math.random() + "_" + name

        // maybe average this over multiple runs?
        console.log("logging " + name)
        obj[name] = JSON.stringify(perfData[0]);

        // Log in local storage, with website name as key
        // Value is stringified performance timing data.
        browser.storage.local.set(obj).then(logOkay, onError)
    } else {
        console.log("failure, name is " + name)
    }


    // todo see if the right window is being closed, or just the current one
    // had to comment this out since window was closing before successful logging
    // window.close()
}

function logOkay() {
    console.log("successfully logged a site")
    window.setTimeout(delayedClose, 5000);
}

function delayedClose() {
    window.close();
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
window.addEventListener("dblclick", perf)