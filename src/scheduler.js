/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
import { clearDriftless, setDriftlessTimeout } from 'driftless';
import { sounds } from './audio';
import getDigitalCode from './get_digital_code';
import { getTime } from './time';
import toneSchedule from './tone_schedule';
import { getStation, pluralize } from './util';

const timerHandles = new Set();

function setTimeout(fn, delay) {
  const id = setDriftlessTimeout(() => {
    fn();
    timerHandles.delete(id);
  }, delay);
  timerHandles.add(id);
}

function play(station, clip, delays, time = 0) {
  const delay = (delays[station] || delays.b) - time;
  if (delay >= 0) {
    setTimeout(() => {
      let prefix = `${station}_`;

      if (station === '') {
        prefix = '';
      }

      sounds.play(`${prefix}${clip}`);
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
  const hour = now.getUTCHours();
  const station = getStation();

  let base = toneSchedule[minute][station === 'v' ? 0 : 1];

  // Don't switch to the hourly 440 tone on the first UTC hour.
  if (hour === 0 && base === '440') {
    base = toneSchedule[minute + 2][station === 'v' ? 0 : 1];
  }

  const d = (clip) => sounds.duration(`${station}_${clip}`);

  // ident message
  let identDuration = 0;
  if (base === 'ident') {
    identDuration = d('ident');

    if (ms - 1000 < identDuration) {
      // TODO seek
      setTimeout(() => {
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
        }, (i - secs) * 1000 + slew);
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
  let hours = hour;
  if (minutes > 59) {
    minutes = 0;
    hours += 1;
  }
  if (hours > 23) {
    hours = 0;
  }

  let vtStart = station === 'h' ? 46500 : 53500;

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

  // Digital code
  const digitalSeq = getDigitalCode(now);
  for (let i = 0; i < digitalSeq.length; i += 1) {
    const m = i + 1;
    const b = m * 1000;

    play('', `digital_${digitalSeq[i]}`, { b }, ms);
  }

  setTimeout(schedule, 60000 - ms);
}

// export function reschedule() {
//   stop();
//   schedule();
// }
//
// let lastTime;
// function jumpDetector() {
//   const now = Date.now();
//   if (lastTime && (now - lastTime) > 2000) {
//     console.log('rescheduling');
//     reschedule();
//   }
//   lastTime = now;
// }
//
// export function startJumpDetector() {
//   setInterval(jumpDetector, 1000);
// }
