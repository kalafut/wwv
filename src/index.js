/* global document */
import Cookies from 'js-cookie';
import { runningClock } from './time';
import {
  $, getStation, hide, show,
} from './util';
import { stop, schedule } from './scheduler';
import { onReady, sounds } from './audio';

let muted = true;
let showPlayIntro = true;

function setBackground() {
  const station = getStation();
  show(station === 'v' ? 'wwv-info' : 'wwvh-info');
  hide(station === 'v' ? 'wwvh-info' : 'wwv-info');
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
    $('statusMessage').innerHTML = 'Loading audio...';
    return;
  }

  hide('statusMessage');

  if (muteState !== null) {
    muted = muteState;
  } else {
    muted = !muted;
  }

  if (muted) {
    show('play');
    hide('pause');
    stop();


    if (showPlayIntro) {
      show('statusMessage');
      $('statusMessage').innerHTML = 'Press play to start audio';
      showPlayIntro = false;
    }
  } else {
    show('pause');
    hide('play');
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

$('play').addEventListener('click', () => {
  audioToggle();
});
$('pause').addEventListener('click', () => {
  audioToggle();
});

setBackground();
init();
