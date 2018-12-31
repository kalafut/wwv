import { getTime } from './time.js';

var clips = {};

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

    for(let t = 0; t < 60; t++) {
        getClip(`v_${t}`);
        getClip(`h_${t}`);
    }
}

export function getClip(name) {
    if(clips[name] == null) {
        clips[name] = new Audio("clips/" + name + ".mp3");
    }

    return clips[name]
}

export class Player {
    constructor() {
        this.queue = {};
        this.playing = {};
        this.stopped = true;
    }

    play(clip) {
        this.playing[clip] = 1;
        clip.play();
    }

    stop() {
        for (var key in this.playing) {
            if (this.playing.hasOwnProperty(key)) {
                this.playing[key].pause();
            }
        }
        this.queue = {};
        this.playing = {};
        this.stopped = true;
    }

    start() {
        this.stopped = false;
    }

    playAt(clip, time, offset, customId) {
        //var self = this;
        var now = getTime();
        var ms = 1000*now.getUTCSeconds() + now.getUTCMilliseconds();

        var diff = time - ms;
        if(diff < 0) {
            diff += 60000;
        };

        let queueId = (customId != null) ? customId : clip;

        var audio = getClip(clip);
        if(diff < 500) {
            if(this.queue[queueId] == null) {
                this.queue[queueId] = true;
                setTimeout(()=>{
                    if(!this.stopped) {
                        if(offset != null) {
                            audio.currentTime = offset / 1000;
                        }
                        audio.onended = ()=>{
                            delete this.queue[queueId];
                            delete this.playing[queueId];
                        }
                        this.playing[queueId] = audio;
                        audio.play();
                    }
                }, diff);
            }
        }

        return audio;
    }
}

preload();
