import { Howl } from 'howler';
import spriteLayout from './sprite_layout';

let clipsLoaded = 0;
let container;
let readyFn;

function load() {
  clipsLoaded += 1;
  if (clipsLoaded >= 3) {
    readyFn();
  }
}

export function onReady(fn) {
  if (clipsLoaded >= 3) {
    fn();
  } else {
    readyFn = fn;
  }
}


spriteLayout.onload = () => {
  container.play('silence');
  load();
};
container = new Howl(spriteLayout);

const idents = {
  h_ident: new Howl({
    src: 'clips/h_ident.mp3',
    onload: load,
  }),
  v_ident: new Howl({
    src: 'clips/v_ident.mp3',
    onload: load,
  }),
};

export const sounds = {
  play(clip) {
    switch (clip) {
      case 'h_ident' || 'v_ident':
        idents[clip].play();
        break;
      default:
        container.play(clip);
    }
  },
  duration(clip) {
    switch (clip) {
      case 'h_ident' || 'v_ident':
        return idents[clip].duration() * 1000;
      default:
        return spriteLayout.sprite[clip][1];
    }
  },
};
