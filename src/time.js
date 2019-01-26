import { $ } from './util';

let startTime = null;
let startMs = null;

// override current time for debugging
const override = true;

if (override) {
  // startTime = '1995-12-17T05:52:25Z';
  startTime = '1995-12-17T05:00:30Z';
}


export function getTime() {
  if (startTime != null) {
    const now = new Date();
    const fakeStart = new Date(startTime);
    if (startMs == null) {
      startMs = now.getTime();
      return fakeStart;
    }
    const elapsed = now.getTime() - startMs;
    return new Date(fakeStart.getTime() + elapsed);
  }
  return new Date();
}

let nextText = '';
export function runningClock() {
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
