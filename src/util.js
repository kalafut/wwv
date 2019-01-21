/* global document */

export function $(id) {
  return document.getElementById(id);
}

export function getStation() {
  return document.querySelector('input[name="station"]:checked').value;
}
