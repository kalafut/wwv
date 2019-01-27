/* global document */
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

$('startButton').addEventListener('click', () => {
  $('loadingBox').classList.add('hidden');
  $('clock_block').classList.remove('hidden');
  runningClock();
  schedule();
  // startJumpDetector();
});


function init() {
  $('loadingBox').classList.remove('none');

  onReady(() => {
    const el = $('startButton');
    el.disabled = false;
    el.innerHTML = 'Play';
  });
}

setBackground();
init();
