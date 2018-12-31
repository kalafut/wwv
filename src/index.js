import { Player, getClip } from './player.js';
import { getTime } from './time.js';
import { pluralize } from './util.js';

var player = new Player();

var runningClock = function() {
    var nextText = "";
    function updateClock() {
        var clock = document.getElementById("clock");
        clock.innerHTML = nextText;

        var now = getTime();
        var delay = 1000 - now.getUTCMilliseconds();
        now.setUTCSeconds(now.getUTCSeconds()+1);
        nextText = now.toISOString().substring(11,19)
        setTimeout(updateClock, delay);
    }
    return updateClock;
}();

function timeAudio(station, hours, minutes, nextMinute, onended) {
    if(nextMinute) {
        minutes++;
        if(minutes > 59) {
            minutes = 0;
            hours++;
        }
        if(hours > 23) {
            hours = 0;
        }
    }

    var clips = [[station + "_" + hours, 0]];

    var haudio = (hours == 1) ? station + "_hour" : station + "_hours";
    clips.push([haudio, 0])
    clips.push([station + "_" + minutes, 100])

    var maudio = (minutes == 1) ? station + "_minute": station + "_minutes";
    clips.push([maudio, 100])

    var total = 0
    clips.forEach(function (clip) {
        player.playAt(clip[0], total + clip[1]);
        total += getClip(clip[0]).duration * 1000;
    })
}


var stopPlaying = false;

let q = {};
function condx(id, fn, expiration) {
    let now = getTime().getTime();
    let prevExpiration = q[id];

    if(prev != null && prevExpire < now) {
        return;
    }

    q[id] = now + expiration
    fn();
}

function realtime() {
    if(muted) {
        return;
    }

    var now = getTime();
    var hours = now.getUTCHours();
    var minutes = now.getUTCMinutes();
    var secs = now.getUTCSeconds();
    var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();
    var m = now.getUTCMilliseconds();
    var station = getStation();

    if(minutes == 59) {
        player.playAt("hour_pulse", 0);
    } else {
        player.playAt(station + "_minute_pulse", 0);
    }

    // pick correct tone file
    var earlyPulseStart = 0;
    if((minutes + 1) % 2 === 0) {
        var clip = "_main_500";
    } else {
        var clip = "_main_600";
    }

    if(((minutes == 0 || minutes == 30) && station == "v")
        || ((minutes == 29 || minutes == 59) && station == "h")) {
        clip = "_ident";
        earlyPulseStart = station == "v" ? 11 : 6;
    }

    if((minutes == 1 && station == "h") || (minutes == 2 && station == "v")) {
        var clip = "_main_440";
    }

    clip = station + clip;
    var clipDuration = getClip(clip).duration;

    if(secs >= 1 && secs < clipDuration) {
        var offset = ms - 1000;
        player.playAt(clip, ms + 50, offset);
    } else {
        player.playAt(clip, 1000);
    }

    // Pulses and voice time
    if(secs > clipDuration - 1 && secs != 58) {
        player.playAt(station + "_pulse", ((secs+1)*1000) % 60000);
    }

    player.playAt(station + "_at_the_tone2",  station == "h" ? 45500 : 52500);

    // Play voice time announcing
    minutes++;
    if(minutes > 59) {
        minutes = 0;
        hours++;
    }
    if(hours > 23) {
        hours = 0;
    }

    let vtStart = (station == "h") ? 46500 : 53500;

    clip = player.playAt(`${station}_${hours}`, vtStart, 0, "vt1");

    vtStart += clip.duration * 1000;
    clip = player.playAt(`${station}_${pluralize("hour", hours)}`, vtStart, 0, "vt2");

    vtStart += clip.duration * 1000 + 100;
    clip = player.playAt(`${station}_${minutes}`, vtStart, 0, "vt3");

    vtStart += clip.duration * 1000 + 100;
    clip = player.playAt(`${station}_${pluralize("minute", minutes)}`, vtStart, 0, "vt4");

    // "coordinated universal time"
    player.playAt(station + "_utc2", station == "h" ? 49750 : 56750);

    setTimeout(realtime, 200);
}

//function stop() {
//    stopPlaying = true;
//    document.getElementById("go").disabled = false;
//}
//
//function go() {
//    realtime();
//    document.getElementById("go").disabled = true;
//}

function getStation() {
    return document.getElementById("station").value;
}

function setStation() {
    var stationClass = getStation() == "h" ? "wwvh" : "wwv";
    document.getElementById("body").className = "background " + stationClass;
}

let muted = false;
function audioToggle() {
    muted = !muted;
    let el = document.getElementById("audio");
    el.src = muted ? "unmute.svg" : "mute.svg";

    if(muted) {
        player.stop();
    } else {
        player.start();
        realtime();
    }
}

audioToggle();
setStation();
runningClock();
realtime();
window.audioToggle = audioToggle;
