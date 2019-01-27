/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
import { clearDriftless, setDriftlessTimeout } from 'driftless';
import { getTime } from './time';
import { container } from './player';
import toneSchedule from './tone_schedule';
import { sounds } from './audio';
import { getStation } from './util';

const timerHandles = new Set();

function setTimeout(fn, delay) {
  const id = setDriftlessTimeout(() => {
    fn();
    timerHandles.delete(id);
  }, delay);
  timerHandles.add(id);
}

function pluralize(s, amt) {
  let ret = (s);
  if (amt !== 1) {
    ret += 's';
  }

  return ret;
}

function play(station, clip, delays, time = 0) {
  const delay = (delays[station] || delays.b) - time;
  if (delay >= 0) {
    setTimeout(() => {
      let prefix = `${station}_`;

      if (station === '') {
        prefix = '';
      }

      container.play(`${prefix}${clip}`);
    }, delay);
  }
}

export function stop() {
  timerHandles.forEach((id) => {
    clearDriftless(id);
  });
  timerHandles.clear();
}

export function schedule() {
  const now = getTime();
  const secs = now.getUTCSeconds();
  const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();
  const slew = 1000 - now.getUTCMilliseconds();
  const minute = now.getUTCMinutes();

  const station = getStation();

  const base = toneSchedule[minute][station === 'v' ? 0 : 1];

  const d = clip => sounds.duration(`${station}_${clip}`);

  // ident message
  let identDuration = 0;
  if (base === 'ident') {
    identDuration = d('ident');

    if (ms - 1000 < identDuration) {
      // TODO seek
      setTimeout(() => {
        // hIdent.seek((ms - 1000) / 1000);
        sounds.seek(`${station}_ident`, ms - 1000);
        sounds.play(`${station}_ident`);
      }, Math.max(1000 - ms, 0));
    }
  }

  // pulses
  for (let i = secs; i < 60; i += 1) {
    if (i * 1000 >= identDuration) {
      let clip;
      let tone = base;

      if (identDuration > 0 || i >= 44) {
        tone = '0';
      }

      clip = `${station}_pulse_tone_${tone}`;

      if (i === 27 || i === 57) {
        clip = `${station}_pulse_long_tone_${tone}`;
      }

      if (i !== 28 && i !== 58) {
        setTimeout(() => {
          sounds.play(clip);
        }, ((i - secs) * 1000) + slew);
      }
    }
  }

  const p = (...args) => {
    play(station, ...args);
  };


  // minute or hour pulse
  if (ms < 59000) {
    if (minute === 59) {
      play('', 'hour_pulse', { b: 60000 }, ms);
    } else {
      p('minute_pulse', { b: 60000 }, ms);
    }
  }

  // "at the tone"
  p('at_the_tone', { h: 45500, v: 52500 }, ms);

  // Voice announcement for next minute
  let minutes = now.getUTCMinutes() + 1;
  let hours = now.getUTCHours();
  if (minutes > 59) {
    minutes = 0;
    hours += 1;
  }
  if (hours > 23) {
    hours = 0;
  }

  let vtStart = (station === 'h') ? 46500 : 53500;

  let clip = `${hours}`;
  p(clip, { b: vtStart }, ms);
  vtStart += d(clip) + 100;

  clip = pluralize('hour', hours);
  p(clip, { b: vtStart }, ms);
  vtStart += d(clip) + 400;

  clip = `${minutes}`;
  p(clip, { b: vtStart }, ms);
  vtStart += d(clip) + 100;

  clip = pluralize('minute', minutes);
  p(clip, { b: vtStart }, ms);

  vtStart += d(clip) + 400;
  p('utc', { b: vtStart }, ms);

  setTimeout(schedule, 60000 - ms);
}
