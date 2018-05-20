var at_the_tone = document.getElementById("at_the_tone"); // start T-7.6s
var h23 = document.getElementById("h23"); // start T-7.6s
var m53 = document.getElementById("m53"); // start T-7.6s

function go() {
    var now = new Date();

    var ms = 1000*now.getSeconds() + now.getMilliseconds();
    var timeLeft = 60000-ms;

    el.currentTime=80;
    var wait = timeLeft-(12 * 1000);
    if(wait < 0) {
        wait += 60000;
    }
    console.log(wait);
    setTimeout('el.play()', wait);
    //el.play();
}

function playAt(el, time) {
    var now = new Date();
    var ms = 1000*now.getSeconds() + now.getMilliseconds();
    var wait = time - ms;

    if(wait >= 0) {
    }

    console.log(wait);
    setTimeout(el.play.bind(el), wait);
}

function stop() {
    document.getElementById("aud0").pause();
}

playAt(at_the_tone, 52400);
playAt(h23, 53300);
playAt(m53, 54800);
playAt(utc, 56500);

//go();
