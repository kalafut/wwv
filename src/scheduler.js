/* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
import { setDriftlessTimeout } from 'driftless';
import { getTime } from './time';
import { container, hIdent } from './player';
import spriteLayout from './sprite_layout';
import toneSchedule from './tone_schedule';

export default function schedule() {
  const now = getTime();
  const secs = now.getUTCSeconds();
  const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();
  const slew = 1000 - now.getUTCMilliseconds();
  const minute = now.getUTCMinutes();

  const station = 'h';

  const base = toneSchedule[minute][station === 'v' ? 0 : 1];

  // ident message
  let identDuration = 0;
  if (base === 'ident') {
    identDuration = spriteLayout.sprite[`${station}_ident`][1];

    if (ms - 1000 < identDuration) {
      setDriftlessTimeout(() => {
        hIdent.seek((ms - 1000) / 1000);
        hIdent.play();
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
          console.log(i);
          container.play(clip);
        }, ((i - secs) * 1000) + slew);
      }
    }
  }

  // minute pulse
  if (ms < 59000) {
    setDriftlessTimeout(() => {
      container.play('v_minute_pulse');
    }, 60000 - ms);
  }

  setDriftlessTimeout(schedule, 60000 - ms);
}
