/* global document */
import { runningClock } from './time';
import {
  $, getStation, hide, shouldShowPlayMsg, show,
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

function init() {
  audioToggle('loading');
  showPlayIntro = shouldShowPlayMsg();
  startClock();

  onReady(() => {
    audioToggle(true);
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
