/* global document, window */
import Cookies from 'js-cookie';
import { runningClock } from './time';
import { $, getStation } from './util';
import { stop, schedule } from './scheduler';
import { onReady, sounds } from './audio';

let muted = true;

function setBackground() {
  const stationClass = (getStation() === 'h') ? 'wwvh' : 'wwv';
  $('body').className = `background ${stationClass}`;
}

function setStation() {
  setBackground();
  if (!muted) {
    sounds.stop();
    stop();
    schedule();
  }
}

document.querySelectorAll('input[name="station"]').forEach((el) => {
  el.addEventListener('change', setStation);
});

function audioToggle(muteState = null) {
  if (muteState === 'loading') {
    $('audio').classList.add('none');
    $('loadingMessage').classList.remove('none');
    return;
  }

  $('audio').classList.remove('none');
  $('loadingMessage').classList.add('none');

  if (muteState !== null) {
    muted = muteState;
  } else {
    muted = !muted;
  }
  const el = $('audio');
  el.src = muted ? 'images/muted.svg?v=1' : 'images/unmuted.svg?v=1';

  if (muted) {
    stop();
  } else {
    schedule();
  }
}

function startClock() {
  $('clock_block').classList.remove('hidden');
  runningClock();
}

function go() {
  $('loadingBox').classList.add('hidden');
  startClock();
  audioToggle(false);
  // startJumpDetector();
}

function init() {
  audioToggle('loading');
  if (Cookies.get('intro_shown') === 'y') {
    startClock();
    onReady(() => {
      audioToggle(true);
    });
    return;
  }

  $('loadingBox').classList.remove('hidden');
  $('startButton').addEventListener('click', () => {
    Cookies.set('intro_shown', 'y');
    go();
  });

  onReady(() => {
    const el = $('startButton');
    el.disabled = false;
    el.innerHTML = 'Play';
  });
}

window.audioToggle = audioToggle;

setBackground();
init();
