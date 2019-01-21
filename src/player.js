import { Howl } from 'howler';
import { getTime } from './time';
import spriteLayout from './sprite_layout';

export const container = new Howl(spriteLayout);
export const hIdent = new Howl({
  src: 'clips/h_ident.mp3',
});
container.play('silence');


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
const needed = 1; // (staticClips.length * 2) + 8;
let loaded = 0;
let onReady;
// const pulses = new Howl({
//   src: 'clips/v_pulse_gap.mp3',
//   sprite: {
//     pulse: [0, 4000],
//   },
//   // loop: true,
// });

// pulses.play('pulse');
//
export class Clip {
  constructor(audio, sprite) {
    this.audio = audio;
    this.sprite = sprite;
  }

  duration() {
    return this.audio.duration(this.sprite);
  }

  play() {
    this.id = this.audio.play(this.sprite);
    return this.id;
  }

  pause() {
    this.audio.play(this.id);
  }

  seek(offset) {
    return this.audio.seek(offset, this.sprite);
  }

  on(event, fn) {
    console.log(`Listening for events for: ${this.id}`);
    return this.audio.on(event, fn, this.id);
  }
}


export function loadedAudio() {
  loaded += 1;
  if (loaded >= needed) {
    if (onReady !== null) {
      onReady();
      onReady = null;
    }
  }
}

export function getClip(name) {
  return new Clip(container, name);
}

export function getClipOld(name) {
  let audio;
  if (clips[name] == null) {
    if (name.endsWith('zzz_main_0')) {
      audio = new Howl({
        src: `clips/${name}.mp3`,
        sprite: {
          all: [0, 60000],
          v_after_ident: [0, 4000],
        },
      });
      audio.on('load', loadedAudio);
      clips[name] = audio;
    } else {
      audio = new Howl({ src: `clips/${name}.mp3` });
      audio.on('load', loadedAudio);
      clips[name] = new Clip(audio);
    }
  }

  return clips[name];
}

export function preload(readyFn) {
  if (typeof readyFn !== 'undefined') {
    onReady = readyFn;
    readyFn();
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
    this.queue = new Set();
    this.playing = new Set();
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
    this.queue = new Set();
    this.playing = new Set();
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  // Play a clip at a given time
  playAt(clip, time, offset, customId) {
    const now = getTime();
    const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();

    let diff = time - ms;
    if (diff < 0) {
      diff += 60000;
    }

    const queueId = customId || clip;

    const audio = getClip(clip);
    if (diff < 500) {
      if (!this.queue.has(queueId)) {
        console.log(this.queue);
        console.log(`Adding ${queueId}`);
        this.queue.add(queueId);

        setTimeout(() => {
          if (!this.locked) {
            audio.seek((offset || 0) / 1000);
            audio.play();
            console.log(`playing ${queueId}`);
            this.playing.add(audio);
            audio.on('end', () => {
              this.queue.delete(queueId);
              this.playing.delete(queueId);
              console.log(`Removing ${queueId}`);
            });
          }
        }, diff);
      }
    }

    return audio;
  }
}
