//    thixpin Myanmar Web Viewer
//    Copyright (C) 2018 thixpin (MUA)

//    This program is free software; you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License along
//    with this program; if not, write to the Free Software Foundation, Inc.,
//    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.


// Detecting the browser's unicode redering
function getWidth(t){
    var e = document.createElement("div");
    e.setAttribute("style", "position: absolute; top: -999;");
    e.innerHTML = t ;
    document.body.appendChild(e);
    var ew = e.clientWidth;
    e.parentNode.removeChild(e);
    return ew;
}

function isZawgyiBrowser(){
    return (getWidth("က္က") >= getWidth("က") * 1.5 );
}

var  zawgyiUser = isZawgyiBrowser();
//  End of redering detecting 

/* If converter result is not correct we need to normallize the some error. 
*  eg. double (ု) error due to mac zawgyi keyboard.
*/
function normalize(text){
    text =  text.replace( /(\u102F)(\u102F)/g, "$1");
    return text;
}

/* This method will check the user font and content font.
*  If the content font is not equal the user font, this will convert to user font
*/

function autoConvert(text){
    textIsZawgyi = isZawgyi(text);
    if(textIsZawgyi && !zawgyiUser){
        text = Z1_Uni(text);
        text = normalize(text);
    } else if(!textIsZawgyi && zawgyiUser){
        text = Uni_Z1(text);
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
    + "|\u1039[\u107E-\u1084]";

var Zawgyi = new RegExp(zawgyiRegex);

/* Myanmar text checking regular expression 
 *  is the part of Myanmar Font Tagger
 * http://userscripts-mirror.org/scripts/review/103745 
 */
var Myanmar = new RegExp("[\u1000-\u1021]");

function isMyanmar(input) {
    return Myanmar.test(input) ? true : false;
}

/*
 * This method will check and search Zawgyi Pattern with input text and 
 * return true, if the text is Zawgyi encoding.
 * Parm = input text
 * return = boolean 
 *
 */
function isZawgyi(input) {
    input = input.trim();
    //console.log(input);
    var textSplittedByLine = input.split(/[\f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/);
    for (var i = 0; i < textSplittedByLine.length; i++) {
        var textSplitted = textSplittedByLine[i].split(" ");
        for (var j = 0; j < textSplitted.length; j++) {
            //  console.log(textSplitted[j]);
            if (j != 0)
                textSplitted[j] = " " + textSplitted[j];
            if (Zawgyi.test(textSplitted[j]))
                return true;
        }
    }
    return false;
}


function shouldIgnoreNode(node) {
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
function convertTree(parent) {
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
            convertTree(child);
        } else if (child.nodeType == Node.TEXT_NODE) {
            var text = child.textContent.replace(/[\u200b\uFFFD]/g, "");
            if (text && isMyanmar(text)) {
                if (shouldIgnoreNode(parent) == false) {
                    child.textContent = autoConvert(text);
                    if (parent.className == null || (parent.classList.contains('_c_o_nvert_') == false && parent.classList.contains('text_exposed_show') == false)) {
                        parent.classList.add('_c_o_nvert_');
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


var addObserver = function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var list = document.querySelector('body');

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'childList') {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType == Node.TEXT_NODE) {
                        convertTree(node.parentNode);
                    } else {
                        convertTree(node);
                    }
                }
            } else if (mutation.type == 'characterData') {
                convertTree(mutation.target);
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
if (isMyanmar(title)) {
    document.title = autoConvert(title);
}


var list = document.querySelector('body');
if (list) {
    convertTree(document.body);
}

addObserver();


//    Parabaik Myanmar Text Converter (Zawgyi <> Unicode)
//    Copyright (C) 2014 Ngwe TUN (Solveware Solution)

//    This program is free software; you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 2 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License along
//    with this program; if not, write to the Free Software Foundation, Inc.,
//    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
function Uni_Z1(input)
{
   var output = input;


   output = output.replace(/\u104E\u1004\u103A\u1038/g, '\u104E');
   output = output.replace(/\u102B\u103A/g, '\u105A');
   output = output.replace(/\u102D\u1036/g, '\u108E');
   output = output.replace(/\u103F/g, '\u1086');


   output = output.replace(/(\u102F[\u1036]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1094' : $0 + $1;
   }
   );
   output = output.replace(/(\u1030[\u1036]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1094' : $0 + $1;
   }
   );
   output = output.replace(/(\u1014[\u103A\u1032]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1094' : $0 + $1;
   }
   );
   output = output.replace(/(\u103B[\u1032\u1036]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1095' : $0 + $1;
   }
   );

   output = output.replace(/(\u103D[\u1032]?)\u1037/g,  function($0, $1)
   {
      return $1 ? $1 + '\u1095' : $0 + $1;
   }
   );

   output = output.replace(/([\u103B\u103C\u103D][\u102D\u1036]?)\u102F/g, function($0, $1)
   {
      return $1 ? $1 + '\u1033' : $0 + $1;
   }
   );
   output = output.replace(/((\u1039[\u1000-\u1021])[\u102D\u1036]?)\u102F/g,  function($0, $1)
   {
      return $1 ? $1 + '\u1033' : $0 + $1;
   }
   );
   output = output.replace(/([\u100A\u100C\u1020\u1025\u1029][\u102D\u1036]?)\u102F/g, function($0, $1)
   {
      return $1 ? $1 + '\u1033' : $0 + $1;
   }
   );
   output = output.replace(/([\u103B\u103C][\u103D]?[\u103E]?[\u102D\u1036]?)\u1030/g, function($0, $1)
   {
      return $1 ? $1 + '\u1034' : $0 + $1;

   }
   );
   // uu - 2
   output = output.replace(/((\u1039[\u1000-\u1021])[\u102D\u1036]?)\u1030/g, function($0, $1)
   {
      return $1 ? $1 + '\u1034' : $0 + $1;

   }
   );
   // uu - 2
   output = output.replace(/([\u100A\u100C\u1020\u1025\u1029][\u102D\u1036]?)\u1030/g, function($0, $1)
   {
      return $1 ? $1 + '\u1034' : $0 + $1;

   }
   );
   // uu - 2

   output = output.replace(/(\u103C)\u103E/g, function($0, $1)
   {
      return $1 ? $1 + '\u1087' : $0 + $1;

   }
   );
   // ha - 2


   output = output.replace(/\u1009(?=[\u103A])/g, '\u1025');
   output = output.replace(/\u1009(?=\u1039[\u1000-\u1021])/g, '\u1025');



   // E render
   output = output.replace( /([\u1000-\u1021\u1029])(\u1039[\u1000-\u1021])?([\u103B-\u103E\u1087]*)?\u1031/g, "\u1031$1$2$3");
  
   // Ra render

   output = output.replace( /([\u1000-\u1021\u1029])(\u1039[\u1000-\u1021\u1000-\u1021])?(\u103C)/g, "$3$1$2");



   // Kinzi
   output = output.replace(/\u1004\u103A\u1039/g, "\u1064");
   // kinzi
   output = output.replace(/(\u1064)([\u1031]?)([\u103C]?)([\u1000-\u1021])\u102D/g, "$2$3$4\u108B");
   // reordering kinzi lgt
   output = output.replace(/(\u1064)(\u1031)?(\u103C)?([ \u1000-\u1021])\u102E/g, "$2$3$4\u108C");
   // reordering kinzi lgtsk
   output = output.replace(/(\u1064)(\u1031)?(\u103C)?([ \u1000-\u1021])\u1036/g, "$2$3$4\u108D");
   // reordering kinzi ttt
   output = output.replace(/(\u1064)(\u1031)?(\u103C)?([ \u1000-\u1021])/g, "$2$3$4\u1064");
   // reordering kinzi

   // Consonant

   output = output.replace(/\u100A(?=[\u1039\u102F\u1030])/g, "\u106B");
   // nnya - 2
   output = output.replace(/\u100A/g, "\u100A");
   // nnya

   output = output.replace(/\u101B(?=[\u102F\u1030])/g, "\u1090");
   // ra - 2
   output = output.replace(/\u101B/g, "\u101B");
   // ra

   output = output.replace(/\u1014(?=[\u1039\u103D\u103E\u102F\u1030])/g, "\u108F");
   // na - 2
   output = output.replace(/\u1014/g, "\u1014");
   // na

   // Stacked consonants
   output = output.replace(/\u1039\u1000/g, "\u1060");
   output = output.replace(/\u1039\u1001/g, "\u1061");
   output = output.replace(/\u1039\u1002/g, "\u1062");
   output = output.replace(/\u1039\u1003/g, "\u1063");
   output = output.replace(/\u1039\u1005/g, "\u1065");
   output = output.replace(/\u1039\u1006/g, "\u1066");
   // 1067
   output = output.replace(/([\u1001\u1002\u1004\u1005\u1007\u1012\u1013\u108F\u1015\u1016\u1017\u1019\u101D])\u1066/g, function($0, $1)
   {
      return $1 ? $1 + '\u1067' : $0 + $1;

   }
   );
   // 1067
   output = output.replace(/\u1039\u1007/g, "\u1068");
   output = output.replace(/\u1039\u1008/g, "\u1069");

   output = output.replace(/\u1039\u100F/g, "\u1070");
   output = output.replace(/\u1039\u1010/g, "\u1071");
   // 1072 omit (little shift to right)
   output = output.replace(/([\u1001\u1002\u1004\u1005\u1007\u1012\u1013\u108F\u1015\u1016\u1017\u1019\u101D])\u1071/g, function($0, $1)
   {
      return $1 ? $1 + '\u1072' : $0 + $1;

   }
   );
   // 1067
   output = output.replace(/\u1039\u1011/g, "\u1073");
   // \u1074 omit(little shift to right)
   output = output.replace(/([\u1001\u1002\u1004\u1005\u1007\u1012\u1013\u108F\u1015\u1016\u1017\u1019\u101D])\u1073/g, function($0, $1)
   {
      return $1 ? $1 + '\u1074' : $0 + $1;

   }
   );
   // 1067
   output = output.replace(/\u1039\u1012/g, "\u1075");
   output = output.replace(/\u1039\u1013/g, "\u1076");
   output = output.replace(/\u1039\u1014/g, "\u1077");
   output = output.replace(/\u1039\u1015/g, "\u1078");
   output = output.replace(/\u1039\u1016/g, "\u1079");
   output = output.replace(/\u1039\u1017/g, "\u107A");
   output = output.replace(/\u1039\u1018/g, "\u107B");
   output = output.replace(/\u1039\u1019/g, "\u107C");
   output = output.replace(/\u1039\u101C/g, "\u1085");


   output = output.replace(/\u100F\u1039\u100D/g, "\u1091");
   output = output.replace(/\u100B\u1039\u100C/g, "\u1092");
   output = output.replace(/\u1039\u100C/g, "\u106D");
   output = output.replace(/\u100B\u1039\u100B/g, "\u1097");
   output = output.replace(/\u1039\u100B/g, "\u106C");
   output = output.replace(/\u100E\u1039\u100D/g, "\u106F");
   output = output.replace(/\u100D\u1039\u100D/g, "\u106E");

   output = output.replace(/\u1009(?=\u103A)/g, "\u1025");
   // u
   output = output.replace(/\u1025(?=[\u1039\u102F\u1030])/g, "\u106A");
   // u - 2
   output = output.replace(/\u1025/g, "\u1025");
   // u
   /////////////////////////////////////

   output = output.replace(/\u103A/g, "\u1039");
   // asat

   output = output.replace(/\u103B\u103D\u103E/g, "\u107D\u108A");
   // ya wa ha
   output = output.replace(/\u103D\u103E/g, "\u108A");
   // wa ha

   output = output.replace(/\u103B/g, "\u103A");
   // ya
   output = output.replace(/\u103C/g, "\u103B");
   // ra
   output = output.replace(/\u103D/g, "\u103C");
   // wa
   output = output.replace(/\u103E/g, "\u103D");
   // ha
   output = output.replace(/\u103A(?=[\u103C\u103D\u108A])/g, "\u107D");
   // ya - 2

   output = output.replace(/(\u100A(?:[\u102D\u102E\u1036\u108B\u108C\u108D\u108E])?)\u103D/g, function($0, $1)
   {
      //      return $1 ? $1 + '\u1087 ' : $0 + $1;
      return $1 ? $1 + '\u1087' : $0 ;

   }
   );
   // ha - 2

   output = output.replace(/\u103B(?=[\u1000\u1003\u1006\u100F\u1010\u1011\u1018\u101A\u101C\u101E\u101F\u1021])/g, "\u107E");
   // great Ra with wide consonants
   output = output.replace(/\u107E([\u1000-\u1021\u108F])(?=[\u102D\u102E\u1036\u108B\u108C\u108D\u108E])/g, "\u1080$1");
   // great Ra with upper sign
   output = output.replace(/\u107E([\u1000-\u1021\u108F])(?=[\u103C\u108A])/g, "\u1082$1");
   // great Ra with under signs

   output = output.replace(/\u103B([\u1000-\u1021\u108F])(?=[\u102D \u102E \u1036 \u108B \u108C \u108D \u108E])/g, "\u107F$1");
   // little Ra with upper sign

   output = output.replace(/\u103B([\u1000-\u1021\u108F])(?=[\u103C\u108A])/g, "\u1081$1");
   // little Ra with under signs

   output = output.replace(/(\u1014[\u103A\u1032]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1094' : $0 + $1;

   }
   );
   // aukmyint
   output = output.replace(/(\u1033[\u1036]?)\u1094/g, function($0, $1)
   {
      return $1 ? $1 + '\u1095' : $0 + $1;

   }
   );
   // aukmyint
   output = output.replace(/(\u1034[\u1036]?)\u1094/g, function($0, $1)
   {
      return $1 ? $1 + '\u1095' : $0 + $1;

   }
   );
   // aukmyint
   output = output.replace(/([\u103C\u103D\u108A][\u1032]?)\u1037/g, function($0, $1)
   {
      return $1 ? $1 + '\u1095' : $0 + $1;

   }
   );
   // aukmyint
   return output;

}
// Uni_Z1


//    Parabaik Myanmar Text Converter (Zawgyi <> Unicode)
//    Copyright (C) 2014 Ngwe TUN (Solveware Solution)

//    This program is free software; you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 2 of the License, or
//    (at your option) any later version.

//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License along
//    with this program; if not, write to the Free Software Foundation, Inc.,
//    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
function Z1_Uni(input)
{
  var output=input;

   var tallAA = "\u102B";
   var AA = "\u102C";
   var vi = "\u102D";
   // lone gyi tin
   var ii = "\u102E";
   var u = "\u102F";
   var uu = "\u1030";
   var ve = "\u1031";
   var ai = "\u1032";
   var ans = "\u1036";
   var db = "\u1037";
   var visarga = "\u1038";

   var asat = "\u103A";

   var ya = "\u103B";
   var ra = "\u103C";
   var wa = "\u103D";
   var ha = "\u103E";
   var zero = "\u1040";
   
   
   output =  output.replace( /\u106A/g, " \u1009");
   output =  output.replace( /\u1025(?=[\u1039\u102C])/g, "\u1009"); //new
    output =  output.replace( /\u1025\u102E/g, "\u1026"); //new
   output =  output.replace( /\u106B/g, "\u100A");
   output =  output.replace( /\u1090/g, "\u101B");
   output =  output.replace( /\u1040/g, zero);

   output =  output.replace( /\u108F/g, "\u1014");
   output =  output.replace( /\u1012/g, "\u1012");
   output =  output.replace( /\u1013/g, "\u1013");
   /////////////


   output =  output.replace( /[\u103D\u1087]/g, ha);
   // ha
   output =  output.replace( /\u103C/g, wa);
   // wa
   output =  output.replace( /[\u103B\u107E\u107F\u1080\u1081\u1082\u1083\u1084]/g, ra);
   // ya yint(ra)
   output =  output.replace( /[\u103A\u107D]/g, ya);
   // ya

   output =  output.replace( /\u103E\u103B/g, ya + ha);
   // reorder

   output =  output.replace( /\u108A/g, wa + ha);
   output =  output.replace( /\u103E\u103D/g, wa + ha);
   // wa ha

   ////////////////////// Reordering

   output =  output.replace( /(\u1031)?(\u103C)?([\u1000-\u1021])\u1064/g, "\u1064$1$2$3");
   // reordering kinzi
   output =  output.replace( /(\u1031)?(\u103C)?([\u1000-\u1021])\u108B/g, "\u1064$1$2$3\u102D");
   // reordering kinzi lgt
   output =  output.replace( /(\u1031)?(\u103C)?([\u1000-\u1021])\u108C/g, "\u1064$1$2$3\u102E");
   // reordering kinzi lgtsk
   output =  output.replace( /(\u1031)?(\u103C)?([\u1000-\u1021])\u108D/g, "\u1064$1$2$3\u1036");
   // reordering kinzi ttt

   ////////////////////////////////////////

   output =  output.replace( /\u105A/g, tallAA + asat);
   output =  output.replace( /\u108E/g, vi + ans);
   // lgt ttt
   output =  output.replace( /\u1033/g, u);
   output =  output.replace( /\u1034/g, uu);
   output =  output.replace( /\u1088/g, ha+u);
   // ha  u
   output =  output.replace( /\u1089/g, ha+uu);
   // ha  uu

   ///////////////////////////////////////

   output =  output.replace( /\u1039/g, "\u103A");
   output =  output.replace( /[\u1094\u1095]/g, db);
   // aukmyint

   ///////////////////////////////////////Pasint order human error
    output =  output.replace( /([\u1000-\u1021])([\u102C\u102D\u102E\u1032\u1036]){1,2}([\u1060\u1061\u1062\u1063\u1065\u1066\u1067\u1068\u1069\u1070\u1071\u1072\u1073\u1074\u1075\u1076\u1077\u1078\u1079\u107A\u107B\u107C\u1085])/g, "$1$3$2");  //new
   
   
   
   /////////////

   output =  output.replace( /\u1064/g, "\u1004\u103A\u1039");

   output =  output.replace( /\u104E/g, "\u104E\u1004\u103A\u1038");

   output =  output.replace( /\u1086/g, "\u103F");

   output =  output.replace( /\u1060/g, '\u1039\u1000');
   output =  output.replace( /\u1061/g, '\u1039\u1001');
   output =  output.replace( /\u1062/g, '\u1039\u1002');
   output =  output.replace( /\u1063/g, '\u1039\u1003');
   output =  output.replace( /\u1065/g, '\u1039\u1005');
   output =  output.replace( /[\u1066\u1067]/g, '\u1039\u1006');
   output =  output.replace( /\u1068/g, '\u1039\u1007');
   output =  output.replace( /\u1069/g, '\u1039\u1008');
   output =  output.replace( /\u106C/g, '\u1039\u100B');
   output =  output.replace( /\u1070/g, '\u1039\u100F');
   output =  output.replace( /[\u1071\u1072]/g, '\u1039\u1010');
   output =  output.replace( /[\u1073\u1074]/g, '\u1039\u1011');
   output =  output.replace( /\u1075/g, '\u1039\u1012');
   output =  output.replace( /\u1076/g, '\u1039\u1013');
   output =  output.replace( /\u1077/g, '\u1039\u1014');
   output =  output.replace( /\u1078/g, '\u1039\u1015');
   output =  output.replace( /\u1079/g, '\u1039\u1016');
   output =  output.replace( /\u107A/g, '\u1039\u1017');
   output =  output.replace( /\u107B/g, '\u1039\u1018');
   output =  output.replace( /\u107C/g, '\u1039\u1019');
   output =  output.replace( /\u1085/g, '\u1039\u101C');
   output =  output.replace( /\u106D/g, '\u1039\u100C');

   output =  output.replace( /\u1091/g, '\u100F\u1039\u100D');
   output =  output.replace( /\u1092/g, '\u100B\u1039\u100C');
   output =  output.replace( /\u1097/g, '\u100B\u1039\u100B');
   output =  output.replace( /\u106F/g, '\u100E\u1039\u100D');
   output =  output.replace( /\u106E/g, '\u100D\u1039\u100D');

   /////////////////////////////////////////////////////////

   output =  output.replace( /(\u103C)([\u1000-\u1021])(\u1039[\u1000-\u1021])?/g, "$2$3$1");
   // reordering ra
   
   //output =  output.replace( /(\u103E)?(\u103D)?([\u103B\u103C])/g, "$3$2$1");
   // reordering ra
   
   output =  output.replace( /(\u103E)(\u103D)([\u103B\u103C])/g, "$3$2$1");
    output =  output.replace( /(\u103E)([\u103B\u103C])/g, "$2$1");
    
    output =  output.replace( /(\u103D)([\u103B\u103C])/g, "$2$1");
   
  


  
   
   
   output = output.replace(/(([\u1000-\u101C\u101E-\u102A\u102C\u102E-\u103F\u104C-\u109F]))(\u1040)(?=\u0020)?/g, function($0, $1)
   {
      return $1 ? $1 + '\u101D' : $0 + $1;

   }
   );
   // zero and wa
   
   
    output = output.replace(/((\u101D))(\u1040)(?=\u0020)?/g, function($0, $1)
   {
      return $1 ? $1 + '\u101D' : $0 + $1;

   }
   );
   // zero and wa
   
   
 


   output = output.replace(/(([\u1000-\u101C\u101E-\u102A\u102C\u102E-\u103F\u104C-\u109F\u0020]))(\u1047)/g, function($0, $1)
   {
      return $1 ? $1 + '\u101B' : $0 + $1;

   }
   );
   // seven and ra

   output =  output.replace( /(\u1047)( ? = [\u1000 - \u101C\u101E - \u102A\u102C\u102E - \u103F\u104C - \u109F\u0020])/g, "\u101B");
   // seven and ra
   

  /* output =  output.replace( /(\u1031)?([\u1000-\u1021])(\u1039[\u1000-\u1021])?([\u102D\u102E\u1032])?([\u1036\u1037\u1038]{0,2})([\u103B-\u103E]{0,3})([\u102F\u1030])?([\u102D\u102E\u1032])?/g, "$2$3$6$1$4$8$7$5");
   // reordering storage order*/
   
   output =  output.replace( /(\u1031)?([\u1000-\u1021])(\u1039[\u1000-\u1021])?([\u102D\u102E\u1032])?([\u1036\u1037\u1038]{0,2})([\u103B-\u103E]{0,3})([\u102F\u1030])?([\u1036\u1037\u1038]{0,2})([\u102D\u102E\u1032])?/g, "$2$3$6$1$4$9$7$5$8");
   // reordering storage order 
   output = output.replace(ans+u, u+ans);
   
    output =  output.replace( /(\u103A)(\u1037)/g, "$2$1");
   // For Latest Myanmar3


   return output;


}//Z1_Uni

