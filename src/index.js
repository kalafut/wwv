/* global document */
import { setDriftlessTimeout } from 'driftless';
import { getTime, runningClock } from './time';
import {
  $, getStation, hide, shouldShowPlayMsg, show,
} from './util';
import { stop, schedule } from './scheduler';
import { onReady, sounds } from './audio';

let muted = true;
let showPlayIntro = true;

function setStation() {
  const station = getStation();
  show(station === 'v' ? 'wwv-info' : 'wwvh-info');
  hide(station === 'v' ? 'wwvh-info' : 'wwv-info');

  identDemoToggle(false); // eslint-disable-line no-use-before-define
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
    sounds.stop();

    if (showPlayIntro) {
      show('statusMessage');
      $('statusMessage').innerHTML = 'Press play to start audio';
      showPlayIntro = false;
    }
  } else {
    identDemoToggle(false); // eslint-disable-line no-use-before-define
    show('pause');
    hide('play');
    schedule();
  }
}

function init() {
  audioToggle('loading');
  sounds.volume(0.5);
  showPlayIntro = shouldShowPlayMsg();
  runningClock();

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
$('volume').addEventListener('input', () => {
  const { value } = $('volume');
  sounds.volume(value / 100);
  $('volume-level').innerHTML = `${value}%`;
});

let identDemoPlaying = false;
function identDemoToggle(play = null) {
  if (play !== null) {
    identDemoPlaying = play;
  } else {
    identDemoPlaying = !identDemoPlaying;
  }

  let el;
  let clip;
  if (getStation() === 'v') {
    el = $('play-wwv');
    clip = 'v_ident';
  } else {
    el = $('play-wwvh');
    clip = 'h_ident';
  }

  if (identDemoPlaying) {
    audioToggle(true);
    const slew = 1000 - getTime().getUTCMilliseconds();
    setDriftlessTimeout(() => {
      sounds.play(clip, () => {
        el.innerHTML = 'play';
      });
    }, slew);
    el.innerHTML = 'stop';
  } else {
    sounds.stop();
    el.innerHTML = 'play';
  }
}

$('play-wwv').addEventListener('click', () => identDemoToggle());
$('play-wwvh').addEventListener('click', () => identDemoToggle());

init();
