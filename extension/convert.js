// chrome.storage.sync.remove('preferred_unit');

run();

function run()
{

    chrome.storage.sync.get(["preferred_unit", "highlight", "bold", "underline"], function(object) {

        convert_to = object.preferred_unit;
        highlight = object.highlight;
        bold = object.bold;
        underline = object.underline;
        node = document.body;

        // we default to the user-selected unit preference
        // (set under the 'options' page)
        if (convert_to != undefined)
            walk(node, convert_to, highlight, bold, underline);

        // if no preference has been set, by default we convert to imperial units
        else
            walk(node, "imperial", highlight, bold, underline);

    }); 
}


function walk(node, convert_to, highlight, bold, underline) 
{

    /* 
     * The framework (and some code) for the 'walk' and 'handleText' functions come from Stack Overflow:
     * http://stackoverflow.com/questions/5904914/javascript-regex-to-replace-text-not-in-html-attributes/
     * 
     * Inspiration for this method was found via perusing the source code of the infamous cloud-to-butt extension:
     * https://github.com/panicsteve/cloud-to-butt
     */

    var child, next;

    switch ( node.nodeType )  
    {
        case 1:  // Element
        case 9:  // Document
        case 11: // Document fragment
            child = node.firstChild;
            while ( child ) 
            {
                next = child.nextSibling;
                walk(child, convert_to, highlight, bold, underline);
                child = next;
            }
            break;

        case 3: // Text node
            convertUnits(node, convert_to, highlight, bold, underline);
            break;
    }
}

function convertUnits(text_node, convert_to, highlight, bold, underline)
{
    var units_regex;

    if (convert_to == "imperial")
        units_regex = /([0-9]+(\.[0-9]+)?)(\s)?(kgs|kg|kilograms|kilogram)/ig;
    else
        units_regex = /([0-9]+(\.[0-9]+)?)(\s)?(lbs|lb|pounds|pound)/ig;

    var parent = text_node.parentNode;
    var original_text = text_node.data;
    var original_offset = 0;

    // while there are still items the regex matches in the text_node...
    while (text_node && (result = units_regex.exec(text_node.data))) {

        match_text = result[0];
        original_offset += result.index;

        if (alreadyConverted(convert_to, match_text, original_offset, original_text) == false) {

            match_node = text_node.splitText(result.index);
            match_len = match_text.length;

            // update the remaining search area - was the matched text at the end of the node, or is there still
            // remaining real estate to search?

            if (match_node.data.length > match_len) {

                text_node = match_node.splitText(match_len);

                // tell the search to begin at the beginning of the next node
                // (need to reset exec automatically updating the search index)
                units_regex.lastIndex = 0;

            } else
                text_node = null;

            // create and insert the span housing the unit (and its converted counterpart)
            
            // hover_node = addHoverTrigger(match_node);
            // parent.insertBefore(hover_node, match_node.nextSibling);

            unit_node = addConvertedUnit(match_node.cloneNode(true), result[1], convert_to, highlight, bold, underline);
            // parent.insertBefore(hover_node, match_node.nextSibling);
            parent.insertBefore(unit_node, match_node.nextSibling);
            
            // parent.removeChild(match_node);
            

        }

    }

}

/* function addHoverTrigger(text_node)
{
    span = document.createElement("span");
    span.className = "metric_to_imperial_ht";
    span.textContent = text_node.data;

    return span;
} */

function addConvertedUnit(text_node, unit_value, convert_to, highlight, bold, underline) 
{
    span = document.createElement("span");
    span.className = "metric_to_imperial";
    span.textContent = " ";

    // hover_span = document.createElement("span");
    // hover_span.className = "metric_to_imperial_orig";
    // hover_span.textContent = text_node.data;

    converted_span = document.createElement("span");
    converted_span.className = "metric_to_imperial_converted";

    console.log(highlight);

    if (highlight) converted_span.className += " highlight";

    if (bold) converted_span.className += " bold";

    if (underline) converted_span.className += " underline";

    var converted_value;
    if (convert_to == "imperial")
        converted_value = unit_value * 2.20462;
    else
        converted_value = unit_value / 2.20462;

    if (converted_value < 1)
        converted_value = converted_value.toFixed(2);
    else
        converted_value = converted_value.toFixed(0);

    var converted_unit;
    if (convert_to == "imperial")
        converted_unit = "lbs";
    else
        converted_unit = "kg";

    converted_span.textContent = "(" + converted_value + " " + converted_unit + ")";

    // span.appendChild(hover_span);
    span.appendChild(converted_span);

    return span;

}

function alreadyConverted(convertTo, match, offset, nodeValue)
{
    var num_to_check = 10;

    var chars_before_match = nodeValue.substr(Math.max(offset - num_to_check, 0), offset);
    var chars_after_match = nodeValue.substr(offset + match.length, Math.max(offset + num_to_check, nodeValue.length));

    var lbs = /(pounds|pound|lbs|lb)/i;
    var kgs = /(kilograms|kilogram|kgs|kg)/i

    convertTo == "imperial" ? converted_unit = lbs : converted_unit = kgs;

    if (chars_before_match.match(converted_unit) != null || chars_after_match.match(converted_unit) != null)
        return true 
    else 
        return false;
}

// listen for unit type preference changes

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        console.log(request);

        if (request.change == "unit") {
            removePreviousConversions();
            run();
        } else if (request.change == "emphasis") {
            reformatPreviousConversions();
        }

});

function removePreviousConversions()
{

    var previous_conversions = document.body.getElementsByClassName("metric_to_imperial");

    while (previous_conversions.length > 0) {
        previous_conversions[0].parentElement.removeChild(previous_conversions[0]);
    }

}

// listen for unit formatting type preference changes

function reformatPreviousConversions()
{

    chrome.storage.sync.get(["highlight", "bold", "underline"], function(object) {

        console.log(object);

        var emphasis = "metric_to_imperial_converted";

        if (object.highlight == true) emphasis += " highlight";
        if (object.bold == true) emphasis += " bold";
        if (object.underline == true) emphasis += " underline";

        var previous_conversions = document.body.getElementsByClassName("metric_to_imperial_converted");

        for (var i = 0; i < previous_conversions.length; i++) {
            previous_conversions[i].className = emphasis;
        }

    });

}


/* function addImperialUnits(match, num_kgs, decimal, spaces, kg_label, offset, nodeValue)
{
    var num_lbs = parseFloat(num_kgs) * 2.20462;
    
    if (alreadyConverted("imperial", match, offset, nodeValue) == true)
        return match;
    else {
        
        matched_text = nodeValue.splitText(offset);
        
        span = document.createElement('span');
        span.className = 'metric_to_imperial';

        if (offset + match.length < nodeValue.length) 
            after_matched_text = matched_text.splitText(offset + match.length);
        else
            after_matched_text = null;

        after_matched_text.insertBefore(span);

        span.appendChild(matched_text);
        
    }


    else if (num_lbs < 1)
        return match + " (" + num_kgs.toFixed(2) + " lbs)";
    else
        return match + " (" + num_lbs.toFixed(0) + " lbs)";

}

function addMetricUnits(match, num_lbs, decimal, spaces, lb_label, offset, nodeValue)
{
    var num_kgs = parseFloat(num_lbs) * 0.453592;
    
    if (alreadyConverted("metric", match, offset, nodeValue) == true)
        return match;
    else if (num_kgs < 1)
        return match + " (" + num_kgs.toFixed(2) + " kg)";
    else
        return match + " (" + num_kgs.toFixed(0) + " kg)";
}  */
