# WWV Simulator

Source for https://wwv.mcodes.org

[Hacker News discussion](https://news.ycombinator.com/item?id=19144003)

## Functionality

Simulates the audio portion of WWV. For more information, [visit the site](https://wwv.mcodes.org).

## Running locally

The compiled site is in the `dist` folder. You'll need to serve it from something
and cannot just open `index.html` from the file system. One easy method is to
use Python to serve the directory. Just `cd` into it and run: `python3 -m http.server`

## Building

If you want to build the site, here are the basic steps:

1. Install [NodeJS](https://nodejs.org)
1. Clone or download this repo and navigate to it.
1. Install dependencies: `npm install`. If you're running on MacOS and
   haven't installed Command Line Tools for Xcode, you might see some
   errors. As far as I can tell they don't prevent building.
1. Build: `npx webpack`

At this point you'll have the full site in `./dist`.
