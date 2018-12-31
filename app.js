if(1) {
    var startTime = '1995-12-17T19:28:40Z';
} else {
    var startTime = null;
}

var clips = {};

var player = {
    queue: {},
    playing: {},
    stopped: false,
    play: function(clip) {
        this.playing[clip] = 1;
        clip.play()
    },
    stop: function() {
        for (var key in this.playing) {
            if (this.playing.hasOwnProperty(key)) {
                this.playing[key].pause();
            }
        }
        this.playing = {};
    },
    playAt: function(clip, time, offset) {
        var self = this;
        var now = getTime();
        var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();

        var diff = time - ms;
        if(diff < 0) {
            diff += 60000;
        };

        if(diff < 500) {
            if(this.queue[clip] == null) {
                this.queue[clip] = true;
                setTimeout(function() {
                    if(typeof(clip) === "function") {
                        clip();
                        self.queue[clip] = null;
                    } else {
                        var audio = getClip(clip);
                        if(offset != null) {
                            audio.currentTime = offset / 1000;
                        }
                        audio.onended = function() {
                            self.queue[clip] = null;
                            delete self.playing[clip];
                        }
                        console.log(clip);
                        self.playing[clip] = audio;
                        audio.play();
                    }
                }, diff);
            }
        }
    },
}

var playing = {};

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

var stopPlaying = false;
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

    // Play voice time
    player.playAt(function() { timeAudio(station, hours, minutes, true) }, station == "h" ? 46500 : 53500 );

    // "coordinated universal time"
    player.playAt(station + "_utc2", station == "h" ? 49750 : 56750);

    setTimeout(realtime, 200);
}

function stopClips() {
    for (var key in playing) {
        if (playing.hasOwnProperty(key)) {
            playing[key].pause();
            delete playing[key];
        }
    }
    playing = {};
    queue = {};
    //startMs = null;
}

function stop() {
    stopPlaying = true;
    document.getElementById("go").disabled = false;
}

function go() {
    realtime();
    document.getElementById("go").disabled = true;
}

function getStation() {
    return document.getElementById("station").value;
}

function setStation() {
    var stationClass = getStation() == "h" ? "wwvh" : "wwv";
    document.getElementById("body").className = "background " + stationClass;
}

var muted = false;
function audioToggle() {
    muted = !muted;
    el = document.getElementById("audio");
    el.src = muted ? "unmute.svg" : "mute.svg";

    if(muted) {
        stopClips();
    } else {
        realtime();
    }
}

audioToggle();
preload();
setStation();
runningClock();
realtime();
