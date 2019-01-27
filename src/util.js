/* global document */

export function $(id) {
  return document.getElementById(id);
}

export function getStation() {
  return document.querySelector('input[name="station"]:checked').value;
}

export function pluralize(s, amt) {
  let ret = (s);
  if (amt !== 1) {
    ret += 's';
  }

  return ret;
}
