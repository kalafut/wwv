if(1) {
    var startTime = '1995-12-17T19:59:04Z';
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


function stop() {
    document.getElementById("aud0").pause();
}

function schedule(current) {
    var now = getTime();
    var hours = now.getUTCHours();
    var minutes = now.getUTCMinutes();
    var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();
    var station = getStation();

    if(current) {
        minutes += 1;
    } else {
        minutes += 2;
    }

    if(minutes > 59) {
        minutes = 0;
        hours++;
    }
    if(hours > 23) {
        hours = 0;
    }

    if(current) {
        var delay = -ms;
    } else {
        var delay = 60000 - ms;
    }

    var minutePulse = getClip("v_minute_pulse");

    var identFillDelay = 0;
    var identFill = 0;

    // pick correct tone file
    if((minutes + 1) % 2 === 0) {
        var main = getClip("v_main_500");
    } else {
        var main = getClip("v_main_600");
    }

    minutes = 0;
    if(minutes === 0 && station == "v") {
        var main = getClip("v_ident");
        var identFill = 10;
        var identFillDelay = 35000;
    }

    if(minutes === 0 && station == "h") {
        var main = getClip("h_ident");
        var identFill = 5;
        var identFillDelay = 40000;
    }


    var gap = getClip("v_pulse_gap");
    var att = getClip("v_at_the_tone2");
    var hour = getClip(`v_h_${pad(hours)}`);
    var minute = getClip(`v_m_${pad(minutes)}`);
    var utc = getClip("v_utc2");

    var ho = getOffset(`v_h_${pad(hours)}`);
    var mo = getOffset(`v_m_${pad(minutes)}`);
    //var s = [
    //    [ minutePulse, 0 ],
    //    [ main, 1000 ],
    //    [ gap, 45000 ],
    //    [ att, 52500 ],
    //    [ hour, 53500 + ho ],
    //    [ minute, 55000+ mo ],
    //    [ utc, 56750 ],
    //];
    var testOffset = 0;
    var s = [
        [ minutePulse, 0 ],
        [ main, 1000 ],
        [ "identGap", identFillDelay ],
        [ "gap", 45000 - testOffset ],
        [ att, 52500 - testOffset ],
        [ "time", 53500 - testOffset ],
        //[ hour, 53500 + ho ],
        //[ minute, 55000+ mo ],
        [ utc, 56750 - testOffset ],
    ];


    s.forEach(function (clip) {
        var audio = clip[0];
        var start = clip[1];
        if(current) {
            if(start > ms) {
                setTimeout(audio.play.bind(audio), start - ms);
            } else {
                var currentTime = (ms - start)/1000;
                if(currentTime < audio.duration) {
                    audio.play();
                    audio.currentTime = currentTime;
                }
            }
            schedule(false);
        } else {
            var delay = 60000 - ms;
            //var delay = 0;
            if(audio === "gap") {
                setTimeout(function() { pulses(14); }, start + delay);
            } else if(audio === "time") {
                setTimeout(function() { timeAudio(hours, minutes); }, start + delay);
            } else if(audio === "identGap") {
                setTimeout(function() { pulses(identFill); }, start + delay);
            } else {
                setTimeout(audio.play.bind(audio), start + delay);
                setTimeout(schedule.bind(null, false), 55000 + delay);
            }
        }
    });
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
    getClip("v_minute_pulse");
    getClip("v_main_500");
    getClip("v_pulse_gap");
    getClip("v_at_the_tone");
    getClip("v_utc");
    getClip("v_ident");
    getClip("v_19");
    getClip("v_4");
    getClip("v_1");
    getClip("v_hour");
    getClip("v_hours");
    getClip("v_minute");
    getClip("v_minutes");
    getClip("v_pulse");

    for(hours = 0; hours < 24; hours++) {
        //getClip(`v_h_${pad(hours)}`);
    }

    for(minutes = 0; minutes < 60; minutes++) {
        //getClip(`v_m_${pad(minutes)}`);
        getClip(`v_${minutes}`);
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

function pulses(count) {
    if(count <= 0) {
        return;
    }

    var played = 0;
    var timerId = 0;

    var audio = getClip("v_pulse");
    audio.play();
    played++;

    timerId = setInterval(function() {
        audio.play();
        played++;
        if(played >= count) {
            clearInterval(timerId);
        }
    }, 1000);
}

function timeAudio(hours, minutes, nextMinute) {
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

    var clips = [[getClip("v_" + hours), 0]];

    var haudio = (hours == 1) ? getClip("v_hour") : getClip("v_hours");
    clips.push([haudio, 0])
    clips.push([getClip("v_" + minutes), 100])

    var maudio = (minutes == 1) ? getClip("v_minute"): getClip("v_minutes");
    clips.push([maudio, 100])

    var total = 0
    clips.forEach(function (clip) {
        console.log(clip[0]);
        console.log(total + clip[1]);
        setTimeout(clip[0].play.bind(clip[0]), total + clip[1]);
        console.log(clip[0].duration);
        total += clip[0].duration * 1000;
    })
}

function pulse() {
    var audio = getClip("v_pulse");
    audio.play();
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

    playAt("v_minute_pulse", 0);

    // pick correct tone file
    if((minutes + 1) % 2 === 0) {
        var clip = "_main_500";
    } else {
        var clip = "_main_600";
    }

    if(((minutes == 0 || minutes == 30) && station == "v")
        || ((minutes == 1 || minutes == 59) && station == "v")) {
        clip = "_ident";
    }

    if(secs >=1 && secs < 30) {
        var offset = ms - 1000;
        playAt(station + clip, ms + 50, offset);
    } else {
        playAt(station + clip, 1000);
    }

    // pulses
    if(secs > 44 && secs != 58) {
        playAt("v_pulse", ((secs+1)*1000) % 60000);
    }

    playAt("v_at_the_tone2", 52500);

    // Play voice time
    playAt(function() {timeAudio(hours, minutes, true)}, 53500);

    // "coordinated universal time"
    playAt("v_utc2", 56750);

    playAt(function() {updateClock()}, ((secs+1)*1000) % 60000);
    setTimeout(realtime, 200);
}

function go() {
    //setInterval(clock, 1000);
    //schedule(false);
    realtime();

    document.getElementById("go").disabled = true;
}

function getStation(name) {
    return "v"
}


preload();

