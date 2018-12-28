if(1) {
    var startTime = '1995-12-17T19:0j:55Z';
} else {
    var startTime = null;
}

var clips = {};

function getClip(name) {
    if(clips[name] == null) {
        clips[name] = new Audio("clips/" + name + ".mp3");
    }

    return clips[name]
}

function pad(num) {
    var s = num+"";
    if(num < 10) {
        s = "0" + s;
    }
    return s;
}

var startMs = null;
function getTime() {
    if(startTime != null) {
        var now = new Date();
        var fakeStart = new Date(startTime);
        if(startMs == null) {
            startMs = now.getTime();
            return fakeStart;
        } else {
            var elapsed = now.getTime() - startMs;
            return new Date(fakeStart.getTime() + elapsed)
        }
    }
    return new Date();
}

function preload() {
    [
    "_minute_pulse",
    "_main_440",
    "_main_500",
    "_main_600",
    "_pulse_gap",
    "_at_the_tone",
    "_utc2",
    "_ident",
    "_hour",
    "_hours",
    "_minute",
    "_minutes",
    "_pulse",
    ].forEach(function(clip) {
        getClip("v" + clip);
        getClip("h" + clip);
    });

    for(t = 0; t < 60; t++) {
        getClip(`v_${t}`);
        getClip(`h_${t}`);
    }
}

var lastClockText = "";
function updateClock() {
    var now = getTime();
    var text = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()) + ":" + pad(now.getUTCSeconds());
    if(text != lastClockText) {
        var clock = document.getElementById("clock");
        clock.innerHTML = text;
        lastClockText = text;
    }
}

function timeAudio(station, hours, minutes, nextMinute) {
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

    var clips = [[getClip(station + "_" + hours), 0]];

    var haudio = (hours == 1) ? getClip(station + "_hour") : getClip(station + "_hours");
    clips.push([haudio, 0])
    clips.push([getClip(station + "_" + minutes), 100])

    var maudio = (minutes == 1) ? getClip(station + "_minute"): getClip(station + "_minutes");
    clips.push([maudio, 100])

    var total = 0
    clips.forEach(function (clip) {
        setTimeout(clip[0].play.bind(clip[0]), total + clip[1]);
        total += clip[0].duration * 1000;
    })
}

var queue = {};

function playAt(clip, time, offset) {
    var now = getTime();
    var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();

    var diff = time - ms;
    if(diff < 0) {
        diff += 60000;
    };

    if(diff < 500) {
        if(queue[clip] == null) {
            queue[clip] = true;
            setTimeout(function() {
                if(typeof(clip) === "function") {
                    clip();
                    queue[clip] = null;
                } else {
                    var audio = getClip(clip);
                    if(offset != null) {
                        audio.currentTime = offset / 1000;
                    }
                    audio.onended = function() {
                        queue[clip] = null;
                    }
                    audio.play();
                }
            }, diff);
        }
    }
}

function realtime() {
    var now = getTime();
    var hours = now.getUTCHours();
    var minutes = now.getUTCMinutes();
    var secs = now.getUTCSeconds();
    var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();
    var m = now.getUTCMilliseconds();
    var station = getStation();

    if(minutes == 59) {
        playAt("hour_pulse", 0);
    } else {
        playAt(station + "_minute_pulse", 0);
    }

    // pick correct tone file
    var earlyPulseStart = 0;
    if((minutes + 1) % 2 === 0) {
        var clip = "_main_500";
    } else {
        var clip = "_main_600";
    }

    if(((minutes == 0 || minutes == 30) && station == "v")
        || ((minutes == 1 || minutes == 59) && station == "h")) {
        clip = "_ident";
        earlyPulseStart = station == "v" ? 11 : 6;
    }

    if((minutes == 1 && station == "h") || (minutes == 2 && station == "v")) {
        var clip = "_main_440";
    }

    if(secs >= 1 && secs < 30) {
        var offset = ms - 1000;
        playAt(station + clip, ms + 50, offset);
    } else {
        playAt(station + clip, 1000);
    }

    // pulses
    if(secs > 44 - earlyPulseStart && secs != 58) {
        playAt(station + "_pulse", ((secs+1)*1000) % 60000);
    }

    playAt(station + "_at_the_tone2", 52500);

    // Play voice time
    playAt(function() { timeAudio(station, hours, minutes, true) }, 53500);

    // "coordinated universal time"
    playAt(station + "_utc2", 56750);

    playAt(function() {updateClock()}, ((secs+1)*1000) % 60000);
    setTimeout(realtime, 200);
}

function go() {
    realtime();

    document.getElementById("go").disabled = true;
}

function getStation() {
    return document.getElementById("station").value;
}


preload();
