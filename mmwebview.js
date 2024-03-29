// The MIT License (MIT)

// Copyright (c) 2018 thixpin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

(function(){
    //  Disable MUA Web Converter to prevent duplicate converting. 
    var disableMUA = document.createElement("div");
    disableMUA.setAttribute("style", "display: none");
    disableMUA.setAttribute("id", "disableMUA");
    document.body.appendChild(disableMUA);

    // add css to html
    var style = document.createElement("style");
    style.innerHTML = ' @keyframes changecolorhover { to { border-left: 4px solid #FD1100; }} '
                    + ' ._c_o_nvert_:hover{ animation-name: changecolorhover; animation-duration: 1s; animation-timing-function: linear; animation-iteration-count: infinite; animation-direction: alternate; } '
                    + ' ._c_o_nvert_{ border-left: 4px solid #DDDFE2; padding-left: .6em; } ';
    document.head.appendChild(style);
})();

// start code from rabbit

// End code from rabbit

'use strict';

// Detecting the browser's unicode redering
function mmFontWidth(t){
    var e = document.createElement("div");
    e.setAttribute("style", "position: absolute; top: -999;");
    e.innerHTML = t ;
    document.body.appendChild(e);
    var ew = e.clientWidth;
    e.parentNode.removeChild(e);
    return ew;
}

function isZawgyiBrowser(){
    return (mmFontWidth("က္က") >= mmFontWidth("က") * 1.5 );
}

var  zawgyiUser = isZawgyiBrowser();
//  End of redering detecting 

/* If converter result is not correct we need to normallize the some error. 
*  eg. double (ု) error due to mac zawgyi keyboard.
*/
function uniNormalize(text){
    text =  text.replace( /(\u102F)(\u102F)/g, "$1");
    return text;
}

/* This method will check the user font and content font.
*  If the content font is not equal the user font, this will convert to user font
*/

function autoConvert(text){
    textIsZawgyi = isZawgyiTex(text);
    if(textIsZawgyi && !zawgyiUser){
        text = Rabbit.zg2uni(text);
    } else if(!textIsZawgyi && zawgyiUser){
        text = Rabbit.uni2zg(text);
    }
    return text;
}

var zawgyiRegex = "\u1031\u103b" // e+medial ra
    // beginning e or medial ra
    + "|^\u1031|^\u103b"
    // independent vowel, dependent vowel, tone , medial ra wa ha (no ya
    // because of 103a+103b is valid in unicode) , digit ,
    // symbol + medial ra
    + "|[\u1022-\u1030\u1032-\u1039\u103b-\u103d\u1040-\u104f]\u103b"
    // end with asat
    + "|\u1039$"
    // medial ha + medial wa
    + "|\u103d\u103c"
    // medial ra + medial wa
    + "|\u103b\u103c"
    // consonant + asat + ya ra wa ha independent vowel e dot below
    // visarga asat medial ra digit symbol
    + "|[\u1000-\u1021]\u1039[\u101a\u101b\u101d\u101f\u1022-\u102a\u1031\u1037-\u1039\u103b\u1040-\u104f]"
    // II+I II ae
    + "|\u102e[\u102d\u103e\u1032]"
    // ae + I II
    + "|\u1032[\u102d\u102e]"
    // I II , II I, I I, II II
    //+ "|[\u102d\u102e][\u102d\u102e]"
    // U UU + U UU
    //+ "|[\u102f\u1030][\u102f\u1030]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // tall aa short aa
    //+ "|[\u102b\u102c][\u102b\u102c]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // shan digit + vowel
    + "|[\u1090-\u1099][\u102b-\u1030\u1032\u1037\u103c-\u103e]"
    // consonant + medial ya + dependent vowel tone asat
    + "|[\u1000-\u102a]\u103a[\u102c-\u102e\u1032-\u1036]"
    // independent vowel dependent vowel tone digit + e [ FIXED !!! - not include medial ]
    + "|[\u1023-\u1030\u1032-\u1039\u1040-\u104f]\u1031"
    // other shapes of medial ra + consonant not in Shan consonant
    + "|[\u107e-\u1084][\u1001\u1003\u1005-\u100f\u1012-\u1014\u1016-\u1018\u101f]"
    // u + asat
    + "|\u1025\u1039"
    // eain-dray
    + "|[\u1081\u1083]\u108f"
    // short na + stack characters
    + "|\u108f[\u1060-\u108d]"
    // I II ae dow bolow above + asat typing error
    + "|[\u102d-\u1030\u1032\u1036\u1037]\u1039"
    // aa + asat awww
    + "|\u102c\u1039"
    // ya + medial wa
    + "|\u101b\u103c"
    // non digit + zero + \u102d (i vowel) [FIXED!!! rules tested zero + i vowel in numeric usage]
    + "|[^\u1040-\u1049]\u1040\u102d"
    // e + zero + vowel
    + "|\u1031?\u1040[\u102b\u105a\u102e-\u1030\u1032\u1036-\u1038]"
    // e + seven + vowel
    + "|\u1031?\u1047[\u102c-\u1030\u1032\u1036-\u1038]"
    // cons + asat + cons + virama
    //+ "|[\u1000-\u1021]\u103A[\u1000-\u1021]\u1039" [ FIXED!!! REMOVED!!! conflict with Mon's Medial ]
    // U | UU | AI + (zawgyi) dot below
    + "|[\u102f\u1030\u1032]\u1094"
    // virama + (zawgyi) medial ra
    + "|\u1039[\u107E-\u1084]"

    // rules add by thixpin
    // space + e + consonant
    + "|[ $A-Za-z0-9]\u1031[\u1000-\u1021]"
    // consonant + Visarga 
    + "|[\u1000-\u1021]\u1038";

var ZawgyiReg = new RegExp(zawgyiRegex);

/* Myanmar text checking regular expression 
 *  is the part of Myanmar Font Tagger
 * http://userscripts-mirror.org/scripts/review/103745 
 */
var MyanmarReg = new RegExp("[\u1000-\u1021]");

function isMyanmarText(input) {
    return MyanmarReg.test(input) ? true : false;
}

/*
 * This method will check and search Zawgyi Pattern with input text and 
 * return true, if the text is Zawgyi encoding.
 * Parm = input text
 * return = boolean 
 *
 */
function isZawgyiTex(input) {
    input = input.trim();
    //console.log(input);
    var textSplittedByLine = input.split(/[\f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/);
    for (var i = 0; i < textSplittedByLine.length; i++) {
        var textSplitted = textSplittedByLine[i].split(" ");
        for (var j = 0; j < textSplitted.length; j++) {
            //  console.log(textSplitted[j]);
            if (j != 0)
                textSplitted[j] = " " + textSplitted[j];
            if (ZawgyiReg.test(textSplitted[j]))
                return true;
        }
    }
    return false;
}


function shouldIgnoreElement(node) {
    if (node.nodeName == "INPUT" || node.nodeName == "SCRIPT" || node.nodeName == "TEXTAREA") {
        return true;
    } else if (node.isContentEditable == true) {
        return true;
    }
    return false;
}

/*
 * This part are from Myanmar Font Tagger scripts developed by Ko Thant Thet Khin Zaw
 * http://userscripts-mirror.org/scripts/review/103745
 */
function convert_Tree(parent) {
    if (parent instanceof Node == false || parent instanceof SVGElement) {
        return;
    }
    if (parent.className != null && parent.classList.contains('_c_o_nvert_') == true) {
        //console.log("converted return");
        return;
    }
    for (var i = 0; i < parent.childNodes.length; i++) {
        var child = parent.childNodes[i];
        if (child.nodeType != Node.TEXT_NODE && child.hasChildNodes()) {
            convert_Tree(child);
        } else if (child.nodeType == Node.TEXT_NODE) {
            var text = child.textContent.replace(/[\u200b\uFFFD]/g, "");
            if (text && isMyanmarText(text) && isZawgyiTex(text) != zawgyiUser) {
                if (shouldIgnoreElement(parent) == false) {
                    child.textContent = autoConvert(text);
                    if (parent.className == null || (parent.classList.contains('_c_o_nvert_') == false && parent.classList.contains('text_exposed_show') == false)) {
                        parent.classList.add('_c_o_nvert_');
                        // var parentElement = findParent(parent);
                        // if(isDuplicated(parentElement)===false){
                        //     parentElement.classList.add("i_am_zawgyi");
                        // }
                    }
                }
            }
        }
    }
}

function findParent(element){
    var parentElement = element.parentNode;
    var end = false;
    while(end === false){
        if(parentElement.childNodes.length > 1) {
            if(parentElement.lastChild.nodeName == 'DIV'){
                end = true ;
            } else {
                parentElement = parentElement.parentNode; 
            }            
        } else {
            end = true;
        }
    }
    if(parentElement.nodeName == 'SPAN'){
        parentElement.style.display = 'block';
    } else if(parentElement.nodeName == 'A'){
        parentElement.style.display = 'inline-block';
    }
    return parentElement;
}


var runObserver = function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var list = document.querySelector('body');

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'childList') {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType == Node.TEXT_NODE) {
                        convert_Tree(node.parentNode);
                    } else {
                        convert_Tree(node);
                    }
                }
            } else if (mutation.type == 'characterData') {
                convert_Tree(mutation.target);
            }
        });
    });

    if (list) {
        observer.observe(list, {
            childList: true,
            attributes: false,
            characterData: true,
            subtree: true
        });
    }
}


var title = document.title;
if (isMyanmarText(title)) {
    document.title = autoConvert(title);
}


var list = document.querySelector('body');
if (!list) {
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded",function(){
            runObserver();
        }, false);
    }
} else {
    convert_Tree(document.body);
    runObserver();
}
