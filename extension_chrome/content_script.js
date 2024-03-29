document.body.style.border = "5px solid blue";

// TOGGLE THIS TO SAVE DATA WHEN PREFETCH IS ON OR OFF
var PREFETCH_ON = false;
var windows = {} // ALLISON, GO MAKE YOUR OWN :P <3
var prefetchWindows = {}

function notifyExtension(e) {

    console.log("notify extension");

    var urls = [];
    for(var i = document.links.length; i --> 0;)
        urls.push(document.links[i].href);

    console.log("Pre-emptive prefetching + DNS resolution");
    var i;
    for (i = 0; i < min(5, urls.length); i++) {
        console.log("prefetch - opening: " + i);
        var sending = chrome.runtime.sendMessage({
            url: urls[i], 
            func: "notify",
            numUrlOnPage: min(5, urls.length)
        }, handleMapResponse);

        //sending.then(handleMapResponse, handleError); 
    }
}

function handleError(error){
    console.log("Error: " + JSON.stringify(error));
}

function handleMapResponse(message){
    if (message.currDepth >= 1) {
        console.log("depth past initial")
    } else {
        console.log("url: " + message.thisUrl);
        console.log("num url seen: " + message.numSitesSeen);
        console.log("num url on page: " + message.numUrlonPage);
        if (message.numSitesSeen < 10) {
            if(message.count > 1) {
                console.log("seen twice already, do not reopen");
            } else {
                console.log("seen: " + message.count);
                var temp = window.open(message.thisUrl);
                prefetchWindows[message.thisUrl] = temp

                window.setTimeout(function() {
                    prefetchWindows[message.thisUrl].close()
                    delete(prefetchWindows[message.thisUrl])
                }, 8000)
            }
        }
    }
}

function perf() {
    console.log("PERF IS BEING CALLED")
    // todo extend to be able to start on multiple page sources, not just current page

    var urls = [];
    for(var i = document.links.length; i --> 0;)
        //if (document.links[i].hostname === location.hostname)
        urls.push(document.links[i].href);
    console.log(JSON.stringify(urls))

    var i;
    var num_trials = 10;
    for (var i = 0; i < min(3, urls.length); i++) {
        // repeat each site visit num_trials times
        var rand = i; // Math.floor(Math.random()*urls.length)
        console.log("rand is " + rand)

        // set time out to stagger opening of new URLS
        window.setTimeout(function(rand) {
            for (var j = 0; j < num_trials; j++) {
                var link = urls[rand]
                // set time out to stagger repeated opening of SAME url
                window.setTimeout(function(website, j) {
                    console.log("opening " + website);
                    openPage(website, j);

                    // set time out to close the same window after 8 seconds?
                    window.setTimeout(function(j) {
                        windows[website + j].close()
                        delete(windows[website + j])
                    }, 8000, j)

                }, Math.floor(Math.random() * 60000), link, j);
            }

        }, Math.floor(Math.random() * 15000), rand)
    }

    // close all remaining windows.
    window.setTimeout(closeAllWindows(windows), 70000)
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

function openPage(website, j) {
    console.log("opening " + j + " " + website)
    var temp = window.open(website)
    windows[website + j] = temp
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
        chrome.storage.local.set(obj, function() {
            console.log("successfully logged a site")
        window.setTimeout(delayedClose, 5000);
        });
    } else {
        console.log("failure, name is " + name)
    }


    // todo see if the right window is being closed, or just the current one
    // had to comment this out since window was closing before successful logging
    // window.close()
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

window.addEventListener("load", notifyExtension);

window.addEventListener("load", function() { // IE9+
    setTimeout(getPerfDataOnPage, 5000); // 0, since we just want it to defer.
});

// click triggers the opening and timing of pages linked to by current page.
window.addEventListener("dblclick", perf)
