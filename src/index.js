/* global document, window */
import Cookies from 'js-cookie';
import { runningClock } from './time';
import { $, getStation } from './util';
import { stop, schedule } from './scheduler';
import { onReady, sounds } from './audio';

function setBackground() {
  const stationClass = (getStation() === 'h') ? 'wwvh' : 'wwv';
  $('body').className = `background ${stationClass}`;
}

function setStation() {
  setBackground();
  sounds.stop();
  stop();
  schedule();
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

function go() {
  $('loadingBox').classList.add('hidden');
  $('clock_block').classList.remove('hidden');
  runningClock();
  schedule();
  // startJumpDetector();
}

$('startButton').addEventListener('click', () => {
  Cookies.set('intro_shown', 'y');
  go();
});

function init() {
  $('loadingBox').classList.remove('none');

  onReady(() => {
    const el = $('startButton');
    el.disabled = false;
    el.innerHTML = 'Play';
    if (Cookies.get('intro_shown') === 'y') {
      go();
    }
  });
}

let muted = true;
function audioToggle() {
  muted = !muted;
  const el = $('audio');
  el.src = muted ? 'images/muted.svg?v=1' : 'images/unmuted.svg?v=1';

  if (muted) {
    stop();
  } else {
    schedule();
  }
}

window.audioToggle = audioToggle;

setBackground();
init();
