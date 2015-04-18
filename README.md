# towerwarz

supposed to be LD32-entry, but what ever!

the theme for LD32 is "An Unconventional Weapon", so let me explain how this
game is related to this theme: *it isnt :D*.

i wanted to make this for a long time now and hoped for a theme that fits and..
it didnt. but! maybe i find some way to incorporate the theme into the game
while i am implementing it!

## gameplay

basically a clone of the wc3-funmap linetowerwars (google it)

* players start with some amount of gold and lifes
* players can build towers (maze) on a lane
* players can spawn creatures which cost gold and increase the income
* creatures spawn on the lane next to the player who spawned the creature
* creatures will run south, when they reach the end of the lane
* everytime a creature reaches the bottom of a lane, the player
  who builds on that lane loses 1 life and the player who spawned the creature
  gains 1 life

## implementation

* webgl
* p2p (webrtc + signaling-server or optional [server-less signaling])

## resources

* [Amit’s A* Pages](http://theory.stanford.edu/~amitp/GameProgramming)
* http://qiao.github.io/PathFinding.js/visual
* https://github.com/mikolalysenko/gl-basic-tile-map
* http://blog.tojicode.com/2012/07/sprite-tile-maps-on-gpu.html
* http://blog.tojicode.com/2012/08/more-gpu-tile-map-demos-zelda.html
* http://people.mozilla.org/~jmuizelaar/fishie/fishie-fast.html
* https://github.com/cjb/serverless-webrtc
* http://opengameart.org/content/lpc-girl-variant-2

[server-less signaling]: https://github.com/cjb/serverless-webrtc
