console.log("loaded");

document.getElementById("option_button").addEventListener("click", function() {

    console.log("here");

    // function from https://developer.chrome.com/extensions/optionsV2

    if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL("options.html"));
    }
});