// Saves options to chrome.storage
/*

function save_options() {
    
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('like').checked;
    
    chrome.storage.sync.set({

        favoriteColor: color,
        likesColor: likesColor

    }, function() {
  
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            status.textContent = '';
        }, 750);

    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        favoriteColor: 'red',
        likesColor: true
    }, function(items) {
        document.getElementById('color').value = items.favoriteColor;
        document.getElementById('like').checked = items.likesColor;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

*/

chrome.storage.sync.get(["preferred_unit", "highlight", "bold", "underline"], function(object) {

    convert_to = object.preferred_unit;
    
    if (convert_to == undefined)
        document.getElementById("default_imperial").setAttribute("checked", "yes");
    else if (convert_to == "imperial")
        document.getElementById("default_imperial").setAttribute("checked", "yes");
    else 
        document.getElementById("default_metric").setAttribute("checked", "yes");

    emphasis = ""

    highlight = object.highlight;
    bold = object.bold;
    underline = object.underline;

    if (highlight == true) {
        document.getElementById("highlight").checked = true;
        emphasis += " highlight";
    }

    if (bold == true) {
        document.getElementById("bold").checked = true;
        emphasis += " bold";
    }

    if (underline == true) {
        document.getElementById("underline").checked = true;
        emphasis += " underline";
    }

    if (highlight || bold || underline) {
        document.getElementById("no_emphasis").checked = false;
    }

    for (var i = 0; i < converted_units.length; i++) {
        converted_units[i].className += emphasis;
    }

});

function save_options(convert_to) {

    // save the preference
    chrome.storage.sync.set({
        preferred_unit: convert_to,

    // update all currently open tabs
    }, function() {

        chrome.tabs.query({}, function(tabs) {

            // function from http://stackoverflow.com/questions/16046585/chrome-extension-send-message-from-background-script-to-all-tabs

            var message = {change: "unit"};

            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, message);
                console.log(i);
            }

        });
        
    });

}

var preview_kg = document.getElementById("preview_kg");
var preview_lbs = document.getElementById("preview_lbs");

var kilogram_note = document.getElementById("kilogram_note");
var pound_note = document.getElementById("pound_note");

document.getElementById("default_imperial").addEventListener("click", function() {

    save_options("imperial");

    pound_note.classList.remove("hidden");
    kilogram_note.classList.add("hidden");

    preview_lbs.classList.remove("hidden");
    preview_kg.classList.add("hidden");

});

document.getElementById("default_metric").addEventListener("click", function() {

    save_options("metric");

    pound_note.classList.add("hidden");
    kilogram_note.classList.remove("hidden");

    preview_kg.classList.remove("hidden");
    preview_lbs.classList.add("hidden");

});


// formatting converted units settings

var converted_unit_emphasis = document.getElementsByClassName("converted_unit_emphasis");

for (var i = 0; i < converted_unit_emphasis.length; i++) {
    converted_unit_emphasis[i].addEventListener("click", set_emphasis);
}
    
var converted_units = document.getElementsByClassName("metric_to_imperial_converted");
var no_emphasis = document.getElementById("no_emphasis");

function set_emphasis(e) {

    // determine which tab label was clicked 
    // (and whether or not it was checked or unchecked)
    var emphasis_type = e.target.id;
    var checked = e.target.checked;

    // modify the emphasis appropriately on the preview units
    for (var i = 0; i < converted_units.length; i++) {

        if (emphasis_type == "bold") {
            
            if (checked) {
                converted_units[i].classList.add("bold");
                save_emphasis("bold", true);
            } else {
                converted_units[i].classList.remove("bold");
                save_emphasis("bold", false);
            }

        } else if (emphasis_type == "highlight") {

            if (checked) {
                converted_units[i].classList.add("highlight");
                save_emphasis("highlight", true);
            } else {
                converted_units[i].classList.remove("highlight");
                save_emphasis("highlight", false);
            }

        } else if (emphasis_type == "underline") {

            if (checked) {
                converted_units[i].classList.add("underline");
                save_emphasis("underline", true);
            } else {
                converted_units[i].classList.remove("underline");
                save_emphasis("underline", false);
            }

        } else if (emphasis_type == "no_emphasis") {

            if (checked) {
                converted_units[i].classList.remove("bold", "highlight", "underline");
                save_emphasis("none", true);
            }

        }

    }

    // handle the special no emphasis checkbox (can only be checked if all others are unchecked)
    if (emphasis_type != "no_emphasis" && checked) {
        no_emphasis.checked = false;
    } else if (emphasis_type == "no_emphasis" && checked) {

        // hackey - no emphasis checkbox will always be element 0
        for (var i = 1; i < converted_unit_emphasis.length; i++) {
            converted_unit_emphasis[i].checked = false;        
        }

    }

    // TO DO:
    //
    // 1. Complete Icon Click -> Turn Off / On Extension for Page
    // 2. Complete Custom Filters page
    // 3. Clean Up Code

}

function save_emphasis(style, apply) {

    if (style == "highlight") {

        // save the preference
        chrome.storage.sync.set({
            highlight: apply,

        // update all currently open tabs
        }, relay_emphasis_change);

    } else if (style == "bold") {

        // save the preference
        chrome.storage.sync.set({
            bold: apply,

        // update all currently open tabs
        }, relay_emphasis_change);

    } else if (style == "underline") {

        // save the preference
        chrome.storage.sync.set({
            underline: apply,

        // update all currently open tabs
        }, relay_emphasis_change);

    } else if (style == "none") {

        // save the preference
        chrome.storage.sync.set({
            highlight: false,
            bold: false,
            underline: false

        // update all currently open tabs
        }, relay_emphasis_change);

    }

}

function relay_emphasis_change() {

    chrome.tabs.query({}, function(tabs) {

        // function from http://stackoverflow.com/questions/16046585/chrome-extension-send-message-from-background-script-to-all-tabs

        var message = {change: "emphasis"};

        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, message);
        }

    });

}

var tab_labels = document.getElementsByClassName("tab_label");

for (var i = 0; i < tab_labels.length; i++) {
    tab_labels[i].addEventListener("click", change_tab);
}

var tab_bodies = document.getElementsByClassName("tab_frame");

var general_tab = document.getElementById("general");
var custom_filters_tab = document.getElementById("custom_filters");
var whitelist_tab = document.getElementById("whitelist");
var about_tab = document.getElementById("about");

function change_tab(e) {
    
    // determine which tab label was clicked
    var target_tab = e.target.id;

    // hide all tabs & mark all tab labels as "unclicked"
    for (var i = 0; i < tab_bodies.length; i++) {
        tab_bodies[i].classList.add("hidden");
        tab_labels[i].classList.remove("clicked");
    }

    // now mark the newly clicked tab as clicked
    e.target.classList.add("clicked");

    // and show the corresponding tab body
    if (target_tab == "general_label")
        general_tab.classList.remove("hidden");
    else if (target_tab == "custom_label")
        custom_filters_tab.classList.remove("hidden");
    else if (target_tab == "whitelist_label")
        whitelist_tab.classList.remove("hidden");
    else if (target_tab == "about_label")
        about_tab.classList.remove("hidden");

}

var seek_units = document.getElementById("seek_units");
var conv_factor = document.getElementById("conversion_factor");
var output_units = document.getElementById("output_units");
var filter_preview = document.getElementById("filter_preview");

var filter_inputs = document.getElementsByClassName("filter_input");
for (var i = 0; i < filter_inputs.length; i++) {
    filter_inputs[i].addEventListener("keyup", generateFilterPreview);
}

var seek_list, conversion_factor, output_unit;

function generateFilterPreview() {

    seek_list = seek_units.value.match(/([^,\s]+)/g);
    conversion_factor = parseFloat(conv_factor.value);
    output_unit = output_units.value;

    if (seek_list == null || 
        conversion_factor == NaN || 
        output_unit == "") {

        filter_preview.innerHTML = '1 <span style="color: gray;">[search unit]</span> (<span style="color: gray;">[conversion factor]</span> <span style="color: gray;">[converted units]</span>)<br>Waiting for user to complete entering filter parameters...';

    } else {

        num_units = seek_list.length;
        filter_preview.innerHTML = "";

        for (var i = 0; i < num_units; i++) {
            filter_preview.innerHTML += '1 ' + seek_list[i] + ' (' + conversion_factor + ' ' + output_unit + ')<br>';
        }
    }
    
}

var add_filter = document.getElementById("add_filter");
add_filter.addEventListener("click", generateFilter);
function generateFilter() {

    alert("clicked!");

    if (seek_list == null || 
        conversion_factor == NaN || 
        output_unit == "")
        return;

    seek_units = "";
    for (var i = 0; i < seek_list.length; i++) {
        if (i != seek_list.length - 1)
            seek_units += seek_list[i] + '|';
        else 
            seek_units += seek_list[i];
    }

    console.log("/([0-9]+(\.[0-9]+)?)(\s)?(kgs|kg|kilograms|kilogram)/ig");
    var seek_regex = new RegExp('([0-9]+(\.[0-9]+)?)(\s)?(' + seek_units + ')', 'ig');

    console.log(seek_regex);

}