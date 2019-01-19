import { Howl } from 'howler';
import getTime from './time';

const staticClips = [
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
];

const clips = {};

// Load v and h versions of all static clips and numbers
const needed = (staticClips.length * 2) + (60 * 2);
let loaded = 0;
let onReady;

export function loadedAudio() {
  loaded += 1;
  if (loaded >= needed) {
    if (onReady !== null) {
      onReady();
    }
  }
}

export function getClip(name) {
  if (clips[name] == null) {
    // const audio = new Audio(`clips/${name}.mp3`);
    const audio = new Howl({ src: `clips/${name}.mp3` });
    // audio.addEventListener('canplaythrough', loadedAudio, false);
    audio.on('load', loadedAudio);
    // audio.load();
    clips[name] = audio;
  }

  return clips[name];
}

export function preload(readyFn) {
  onReady = readyFn;
  staticClips.forEach((clip) => {
    getClip(`v${clip}`);
    getClip(`h${clip}`);
  });

  for (let t = 0; t < 60; t += 1) {
    getClip(`v_${t}`);
    getClip(`h_${t}`);
  }
  // onReady();
}


export class Player {
  constructor() {
    this.queue = {};
    this.playing = {};
    this.locked = true;
  }

  play(clip) {
    this.playing[clip] = 1;
    clip.play();
  }

  lock() {
    Object.keys(this.playing).forEach((key) => {
      this.playing[key].pause();
    });
    this.queue = {};
    this.playing = {};
    this.locked = true;
  }

  unlock() {
    this.locked = false;
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
          if (!this.locked) {
            if (offset != null) {
              audio.seek(offset / 1000);
            }
            audio.on('end', () => {
              delete this.queue[queueId];
              delete this.playing[queueId];
            });
            this.playing[queueId] = audio;
            audio.play();
          }
        }, diff);
      }
    }

    return audio;
  }
}
