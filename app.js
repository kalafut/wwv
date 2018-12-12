var at_the_tone = new Audio();
at_the_tone.src="wwv/phrases/v_at_the_tone.mp3";
var h23 = document.getElementById("h23");
var m53 = document.getElementById("m53");

function playAt(el, time) {
    var now = new Date();
    var ms = 1000*now.getSeconds() + now.getMilliseconds();
    var wait = time - ms;

    if(wait >= 0) {
        console.log(wait);
        setTimeout(el.play.bind(el), wait);
    }
}

function stop() {
    document.getElementById("aud0").pause();
}

function schedule() {
    t = getTime();
    var ms = 1000*t.getSeconds() + t.getMilliseconds();
}

function getTime() {
    return new Date();
}

playAt(at_the_tone, 52400);
playAt(h23, 53300);
playAt(m53, 54800);
playAt(utc, 56500);

//go();
