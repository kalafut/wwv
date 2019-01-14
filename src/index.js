/* global document */
import mobileCheck from './mobile';
import { Player, getClip, preload } from './player';
import getTime from './time';

function $(id) {
  return document.getElementById(id);
}

const player = new Player();

function pluralize(s, amt) {
  let ret = (s);
  if (amt !== 1) {
    ret += 's';
  }

  return ret;
}

function getStation() {
  return $('station').value;
}

let nextText = '';
function runningClock() {
  const now = getTime();

  if (nextText === '') {
    nextText = now.toISOString().substring(11, 19);
  }

  const clock = $('clock');
  clock.innerHTML = nextText;

  const delay = 1000 - now.getUTCMilliseconds();
  now.setUTCSeconds(now.getUTCSeconds() + 1);
  nextText = now.toISOString().substring(11, 19);
  setTimeout(runningClock, delay);
}

function loop() {
  const now = getTime();
  let hours = now.getUTCHours();
  let minutes = now.getUTCMinutes();
  const secs = now.getUTCSeconds();
  const ms = 1000 * now.getUTCSeconds() + now.getUTCMilliseconds();
  const station = getStation();
  let clip;

  if (minutes === 59) {
    player.playAt('hour_pulse', 0);
  } else {
    player.playAt(`${station}_minute_pulse`, 0);
  }

  // pick correct tone file
  if ((minutes + 1) % 2 === (station === 'v' ? 0 : 1)) {
    clip = '_main_500';
  } else {
    clip = '_main_600';
  }

  if (((minutes === 0 || minutes === 30) && station === 'v')
        || ((minutes === 29 || minutes === 59) && station === 'h')) {
    clip = '_ident';
  }

  if ((minutes === 1 && station === 'h') || (minutes === 2 && station === 'v')) {
    clip = '_main_440';
  }

  if ((station === 'v' && (minutes === 29 || (minutes >= 43 && minutes <= 52) || minutes === 59))
    || (station === 'h' && (minutes === 0 || (minutes >= 8 && minutes <= 11) || (minutes >= 14 && minutes <= 19) || minutes === 30))
  ) {
    clip = '';
  }

  let clipDuration = 0;

  if (clip !== '') {
    clip = station + clip;
    clipDuration = getClip(clip).duration;

    if (secs >= 1 && secs < clipDuration) {
      player.playAt(clip, ms + 50, ms - 1000);
    } else {
      player.playAt(clip, 1000);
    }
  }

  // Pulses
  if (secs > clipDuration - 1 && secs !== 58) {
    player.playAt(`${station}_pulse`, ((secs + 1) * 1000) % 60000);
  }

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

  vtStart += clip.duration * 1000;
  clip = player.playAt(`${station}_${pluralize('hour', hours)}`, vtStart, 0, 'vt2');

  vtStart += clip.duration * 1000 + 100;
  clip = player.playAt(`${station}_${minutes}`, vtStart, 0, 'vt3');

  vtStart += clip.duration * 1000 + 100;
  clip = player.playAt(`${station}_${pluralize('minute', minutes)}`, vtStart, 0, 'vt4');

  // "coordinated universal time"
  player.playAt(`${station}_utc2`, (station === 'h') ? 49750 : 56750);

  setTimeout(loop, 200);
}

function setStation() {
  const stationClass = (getStation() === 'h') ? 'wwvh' : 'wwv';
  $('body').className = `background ${stationClass}`;

  player.lock();
  player.unlock();
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

$('station').addEventListener('change', setStation);
$('startButton').addEventListener('click', () => {
  $('loadingBox').classList.add('none');
  $('header').classList.remove('hidden');
  runningClock();
  loop();
});

function init() {
  $('loadingBox').classList.remove('none');
  preload(() => {
    const el = $('startButton');
    el.disabled = false;
    el.innerHTML = 'Play';

    player.unlock();
  });
}

if (true || mobileCheck()) {
  $('mobileWarning').classList.remove('none');
  $('mobileAccept').addEventListener('click', () => {
    $('mobileWarning').classList.add('none');
    init();
  });
} else {
  init();
}

setStation();
// runningClock();
