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

function playAt(el, time) {
    var now = getTime();
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

function schedule(current) {
    var now = getTime();
    var hours = now.getUTCHours();
    var minutes = now.getUTCMinutes();
    var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();

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
    var main = getClip("v_main_500");
    var gap = getClip("v_pulse_gap");
    var att = getClip("v_at_the_tone2");
    var hour = getClip(`v_h_${pad(hours)}`);
    var minute = getClip(`v_m_${pad(minutes)}`);
    var utc = getClip("v_utc2");

    if(minutes == 0) {
        main = getClip("v_ident");
    }

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
            } else {
                setTimeout(audio.play.bind(audio), start + delay);
                setTimeout(schedule.bind(null, false), 55000 + delay);
            }
        }
    });
}

function getTime() {
    if(startTime != null) {
        var d = new Date(startTime);
        startTime = null
        return d;
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

var counts = 1;
function clock() {
    var clock = document.getElementById("clock");
    clock.innerHTML = counts;
    counts++;
}

if(0) {
    var startTime = '1995-12-17T19:03:50Z';
} else {
    var startTime = null;
}

function pulses(count) {
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

function timeAudio(hours, minutes) {
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


function go() {
    //timeAudio(19, 5);
    //pulses(60);
    //return;

    setInterval(clock, 1000);
    schedule(false);
    document.getElementById("go").disabled = true;
    //
    //
    ////var audio = getClip("v_pulse_gap");
    //var audio = getClip("v_pulse_gap_lpf_1000_12");
    ////setTimeout(audio.play.bind(audio), 0);
    //var audio = getClip("v_19");
    //setTimeout(audio.play.bind(audio), 0);
    //var audio = getClip("v_hours");
    //setTimeout(audio.play.bind(audio), 700);
    //var audio = getClip("v_4");
    //setTimeout(audio.play.bind(audio), 1500);
    //var audio = getClip("v_minutes");
    //setTimeout(audio.play.bind(audio), 2000);
}

function getOffset(name) {
    var offsets = {
        "v_h_19": -200,
        "v_h_20": -200,
        "v_m_04": -420,
    };
    if (name in offsets) {
        return offsets[name];
    }
    return 0;
}



preload();

