/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
import { setDriftlessTimeout } from 'driftless';
import { getTime } from './time';
import { container } from './player';
import spriteLayout from './sprite_layout';
import toneSchedule from './tone_schedule';
import { sounds } from './clip';

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
    setDriftlessTimeout(() => {
      container.play(`${station}_${clip}`);
    }, delay);
  }
}

export default function schedule() {
  const now = getTime();
  const secs = now.getUTCSeconds();
  const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();
  const slew = 1000 - now.getUTCMilliseconds();
  const minute = now.getUTCMinutes();

  const station = 'v';

  const base = toneSchedule[minute][station === 'v' ? 0 : 1];

  // ident message
  let identDuration = 0;
  if (base === 'ident') {
    identDuration = spriteLayout.sprite[`${station}_ident`][1];

    if (ms - 1000 < identDuration) {
      // TODO seek
      setDriftlessTimeout(() => {
        // hIdent.seek((ms - 1000) / 1000);
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
        setDriftlessTimeout(() => {
          sounds.play(clip);
        }, ((i - secs) * 1000) + slew);
      }
    }
  }

  const p = (...args) => {
    play(station, ...args);
  };

  const d = clip => sounds.duration(`${station}_${clip}`);

  // minute pulse
  if (ms < 59000) {
    p('minute_pulse', { b: 60000 }, ms);
  }

  // "at the tone"
  p('at_the_tone2', { h: 45500, v: 52500 }, ms);

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
  vtStart += d(clip) + 500;

  clip = `${minutes}`;
  p(clip, { b: vtStart }, ms);
  vtStart += d(clip) + 200;

  // vtStart += clip.duration() + 200;
  clip = pluralize('minute', minutes);
  p(clip, { b: vtStart }, ms);

  // "coordinated universal time"
  p('utc2', { h: 49750, v: 56750 }, ms);

  setDriftlessTimeout(schedule, 60000 - ms);
}
