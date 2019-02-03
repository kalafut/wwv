/* global document */
import Cookies from 'js-cookie';

const playMsgCookie = 'playMsgShown';

export function $(id) {
  return document.getElementById(id);
}

export function show(id) {
  $(id).classList.remove('none');
}

export function hide(id) {
  $(id).classList.add('none');
}

export function toggle(id) {
  $(id).classList.toggle('none');
}

export function getStation() {
  return document.querySelector('input[name="station"]:checked').value;
}

export function shouldShowPlayMsg() {
  if (Cookies.get(playMsgCookie) === 'y') {
    return false;
  }
  Cookies.set(playMsgCookie, 'y');
  return true;
}

export function pluralize(s, amt) {
  let ret = (s);
  if (amt !== 1) {
    ret += 's';
  }

  return ret;
}
