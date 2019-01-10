document.body.style.border = "5px solid blue";


function notifyExtension(e) {
    var urls = [];
    for(var i = document.links.length; i --> 0;)
       //  if(document.links[i].hostname === location.hostname)
            urls.push(document.links[i].href);
    // browser.runtime.sendMessage(urls);

    perf()

}


function perf() {
    var urls = [];
    for(var i = document.links.length; i --> 0;)
            urls.push(document.links[i].href);
    console.log(JSON.stringify(urls))

    site_data = {}

    for (var i = 0; i < urls.length; i++) {
        site_data[urls[i]] = getPageData(urls[i]);

        var temp = site_data[urls[i]];

        // console.log("total? TIME FOR " + urls[i] + " is " + JSON.stringify(temp.totalLoadTime));
        // console.log("Performance Data FOR " + urls[i] + " is " + JSON.stringify(temp.perfTiming));

        var pageLoadTime = temp.perfTiming.loadEventEnd - temp.perfTiming.navigationStart;
        console.log("Page load time FOR " + urls[i] + " is " + JSON.stringify(pageLoadTime));
    }

    // console.dir(JSON.stringify(site_data, null, 4))

}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}

function getPageData(website) {
    window = window.open(website, '_self')

    wait(5000)

    // test accessing timing resources
    // CODE USED FROM https://github.com/micmro/performance-bookmarklet/blob/master/src/data.js
    var data = {
        resources: [],
        marks: [],
        measures: [],
        perfTiming: [],
        allResourcesCalc: []
    };

    var isValid = true;

    data.isValid = function () {
        return isValid;
    }

    //Check if the browser supports the timing APIs
    if (window.performance && window.performance.getEntriesByType !== undefined) {
        data.resources = window.performance.getEntriesByType("resource");
        data.marks = window.performance.getEntriesByType("mark");
        data.measures = window.performance.getEntriesByType("measure");
    } else if (window.performance && window.performance.webkitGetEntriesByType !== undefined) {
        data.resources = window.performance.webkitGetEntriesByType("resource");
        data.marks = window.performance.webkitGetEntriesByType("mark");
        data.measures = window.performance.webkitGetEntriesByType("measure");
    } else {
        alert("Oups, looks like this browser does not support the Resource Timing API");
        isValid = false;
        return;
    }

    if (window.performance.timing) {
        data.perfTiming = window.performance.timing;
    } else {
        alert("Oups, looks like this browser does not support performance timing");
        isValid = false;
        return;
    }

    if (data.perfTiming.loadEventEnd - data.perfTiming.navigationStart < 0) {
        alert("Page is still loading - please try again when page is loaded.");
        isValid = false;
        return;
    }

    data.allResourcesCalc = data.resources
        .map((currR, i, arr) => {
        //crunch the resources data into something easier to work with
        const isRequest = currR.name.indexOf("http") === 0;
    var urlFragments, maybeFileName, fileExtension;

    if (isRequest) {
        urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
        maybeFileName = urlFragments[2].split("/").pop();
        fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1);
    } else {
        urlFragments = ["", location.host];
        fileExtension = currR.name.split(":")[0];
    }

    var currRes = {
        name: currR.name,
        domain: urlFragments[1],
        initiatorType: currR.initiatorType || fileExtension || "SourceMap or Not Defined",
        fileExtension: fileExtension || "XHR or Not Defined",
        loadtime: currR.duration,
        // fileType : helper.getFileType(fileExtension, currR.initiatorType),
        isRequestToHost: urlFragments[1] === location.host
    };

    for (var attr in currR) {
        if (typeof currR[attr] !== "function") {
            currRes[attr] = currR[attr];
        }
    }

    if (currR.requestStart) {
        currRes.requestStartDelay = currR.requestStart - currR.startTime;
        currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
        currRes.tcp = currR.connectEnd - currR.connectStart;
        currRes.ttfb = currR.responseStart - currR.startTime;
        currRes.requestDuration = currR.responseStart - currR.requestStart;
    }
    if (currR.secureConnectionStart) {
        currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
    }

    // use json.stringify since otherwise console says "unavailable"
    return currRes;
});

    // ignore for now
    // var allResourcesCalc = data.allResourcesCalc
    // var totalLoadTime = 0;
    // for (var i = 0; i < allResourcesCalc.length; i++) {
    //     totalLoadTime += allResourcesCalc[i].duration;
    // }
    //
    // data.totalLoadTime = totalLoadTime

    return data;

}

/*
Add notifyExtension() as a listener to click events.
*/
window.addEventListener("load", notifyExtension);