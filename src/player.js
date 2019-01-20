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
const needed = (staticClips.length * 2) + 8;
let loaded = 0;
let onReady;

export function loadedAudio() {
  loaded += 1;
  if (loaded >= needed) {
    if (onReady !== null) {
      console.log(onReady);
      onReady();
      onReady = null;
    }
  }
}

export function getClip(name) {
  if (clips[name] == null) {
    const audio = new Howl({ src: `clips/${name}.mp3` });
    audio.on('load', loadedAudio);
    clips[name] = audio;
  }

  return clips[name];
}

export function preload(readyFn) {
  if (typeof readyFn !== 'undefined') {
    onReady = readyFn;
  }
  staticClips.forEach((clip) => {
    getClip(`v${clip}`);
    getClip(`h${clip}`);
  });

  let time = new Date(getTime().getTime() + 60 * 1000);
  for (let t = 0; t < 3; t += 1) {
    const hours = time.getUTCHours();
    const minutes = time.getUTCMinutes();
    getClip(`v_${hours}`);
    getClip(`v_${minutes}`);
    getClip(`h_${hours}`);
    getClip(`h_${minutes}`);

    time = new Date(time.getTime() + 60 * 1000);
  }
  setTimeout(() => {
    preload();
  }, 6000);
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
