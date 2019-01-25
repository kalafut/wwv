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

const hIdent = new Howl({
  src: 'clips/h_ident.mp3',
  onload: load,
});

const vIdent = new Howl({
  src: 'clips/v_ident.mp3',
  onload: load,
});

export const sounds = {
  play(clip) {
    switch (clip) {
      case 'h_ident':
        hIdent.play();
        break;
      case 'v_ident':
        vIdent.play();
        break;
      default:
        container.play(clip);
    }
  },
};
