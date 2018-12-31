/* global Audio */
import getTime from './time';

const clips = {};

export function getClip(name) {
  if (clips[name] == null) {
    clips[name] = new Audio(`clips/${name}.mp3`);
  }

  return clips[name];
}

function preload() {
  [
    '_minute_pulse',
    '_main_440',
    '_main_500',
    '_main_600',
    '_pulse_gap',
    '_at_the_tone',
    '_utc2',
    '_ident',
    '_hour',
    '_hours',
    '_minute',
    '_minutes',
    '_pulse',
  ].forEach((clip) => {
    getClip(`v${clip}`);
    getClip(`h${clip}`);
  });

  for (let t = 0; t < 60; t += 1) {
    getClip(`v_${t}`);
    getClip(`h_${t}`);
  }
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
    Object.keys(this.playing).forEach((key) => {
      this.playing[key].pause();
    });
    this.queue = {};
    this.playing = {};
    this.stopped = true;
  }

  start() {
    this.stopped = false;
  }

  playAt(clip, time, offset, customId) {
    const now = getTime();
    const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();

    let diff = time - ms;
    if (diff < 0) {
      diff += 60000;
    }

    const queueId = (customId != null) ? customId : clip;

    const audio = getClip(clip);
    if (diff < 500) {
      if (this.queue[queueId] == null) {
        this.queue[queueId] = true;
        setTimeout(() => {
          if (!this.stopped) {
            if (offset != null) {
              audio.currentTime = offset / 1000;
            }
            audio.onended = () => {
              delete this.queue[queueId];
              delete this.playing[queueId];
            };
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
