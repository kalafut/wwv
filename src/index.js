/* global document */
import { Player, getClip } from './player';
import { getTime, runningClock } from './time';
import { $, getStation } from './util';
import { stop, schedule } from './scheduler';
import { onReady, sounds } from './audio';

function pluralize(s, amt) {
  if (amt !== 1) {
    return `${s}s`;
  }

  return s;
}

const player = new Player();

function loop() {
  const now = getTime();
  let hours = now.getUTCHours();
  let minutes = now.getUTCMinutes();
  const secs = now.getUTCSeconds();
  const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();
  const station = getStation();
  let clip;
  let tone;
  // let ident = false;

  if (minutes === 59) {
    player.playAt('hour_pulse', 0);
  } else {
    player.playAt(`${station}_minute_pulse`, 0);
  }

  // pick correct tone file
  if ((minutes + 1) % 2 === (station === 'v' ? 0 : 1)) {
    clip = '_main_500';
    tone = '500';
  } else {
    clip = '_main_600';
    tone = '600';
  }

  if (((minutes === 0 || minutes === 30) && station === 'v')
        || ((minutes === 29 || minutes === 59) && station === 'h')) {
    clip = '_ident';
    // ident = true;
  }

  if ((minutes === 1 && station === 'h') || (minutes === 2 && station === 'v')) {
    clip = '_main_440';
    tone = '440';
  }

  if ((station === 'v' && (minutes === 29 || (minutes >= 43 && minutes <= 52) || minutes === 59))
    || (station === 'h' && (minutes === 0 || (minutes >= 8 && minutes <= 11) || (minutes >= 14 && minutes <= 19) || minutes === 30))
  ) {
    // clip = '_main_0';
    clip = '';
    tone = '0';
  }

  let clipDuration = 0;

  if (clip !== '') {
    clip = station + clip;
    clipDuration = getClip(clip).duration();

    if (secs >= 1 && secs < clipDuration) {
      player.playAt(clip, ms + 50, ms - 1000);
    } else {
      player.playAt(clip, 1000);
    }
  }

  // Pulses

  // if (secs > clipDuration - 1 && secs !== 58) {
  if (secs !== 28 && secs !== 58 && secs > 90) {
    player.playAt(`${station}_pulse_tone_${tone}`, ((secs + 1) * 1000) % 60000);
  }
  // }

  // "at the tone"
  player.playAt(`${station}_at_the_tone2`, (station === 'h') ? 45500 : 52500);

  // Voice announcement for next minute
  minutes += 1;
  if (minutes > 59) {
    minutes = 0;
    hours += 1;
  }
  if (hours > 23) {
    hours = 0;
  }

  let vtStart = (station === 'h') ? 46500 : 53500;

  clip = player.playAt(`${station}_${hours}`, vtStart, 0, 'vt1');

  vtStart += clip.duration() + 100;
  clip = player.playAt(`${station}_${pluralize('hour', hours)}`, vtStart, 0, 'vt2');

  vtStart += clip.duration() + 500;
  clip = player.playAt(`${station}_${minutes}`, vtStart, 0, 'vt3');

  vtStart += clip.duration() + 200;
  clip = player.playAt(`${station}_${pluralize('minute', minutes)}`, vtStart, 0, 'vt4');

  // "coordinated universal time"
  player.playAt(`${station}_utc2`, (station === 'h') ? 49750 : 56750);

  setTimeout(loop, 200);
}

function setStation() {
  const stationClass = (getStation() === 'h') ? 'wwvh' : 'wwv';
  $('body').className = `background ${stationClass}`;

  sounds.stop();
  stop();

  /*
  player.lock();
  player.unlock();
  */
}

// Utility to play all number clips for easy comparison
//
// function sayAll(i) {
//  const audio = getClip(`v_${i}`);
//  audio.onended = () => {
//    if (i < 60) {
//      sayAll(i + 1);
//    }
//  };
//  audio.play();
// }
// sayAll(0);

document.querySelectorAll('input[name="station"]').forEach((el) => {
  el.addEventListener('change', setStation);
});

$('startButton').addEventListener('click', () => {
  $('loadingBox').classList.add('hidden');
  $('clock_block').classList.remove('hidden');
  runningClock();
  if (false) {
    loop();
  }
  schedule();
});


function init() {
  $('loadingBox').classList.remove('none');

  onReady(() => {
    const el = $('startButton');
    el.disabled = false;
    el.innerHTML = 'Play';

    player.unlock();
  });
}

init();

setStation();
// Temp
// $('loadingBox').classList.add('none');
