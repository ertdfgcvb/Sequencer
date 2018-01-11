/* jshint esversion: 6 */


// pad
String.prototype.repeat = String.prototype.repeat || function(n){
    return n<=1 ? this : (this + this.repeat(n-1));
};

function padLeft(str, char, length) {
    return char.repeat(Math.max(0, length - str.length)) + str;
}

// costrain
function constrain(v, a, b){
    if (v < a) return a;
    if (v > b) return b;
    return v;
}

export default {
    padLeft,
    constrain
};
