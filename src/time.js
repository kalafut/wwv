let startTime = null;

// override current time for debugging
const override = false;

if (override) {
  startTime = '1995-12-17T19:23:10Z';
}

let startMs = null;

export default function getTime() {
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
