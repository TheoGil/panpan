![Animated preview](./preview.gif)

# PanPan Dog Treats — UI Experiment

<a href="https://theogil.github.io/panpan/" target="_blank">Check out the live version in your browser!</a>

## What

This is a UI experimentation based on a design by Daniel Tan ([link](https://dribbble.com/shots/11062509-PanPan-Dog-Treats-UI))

This is not production-ready code but a technical challenge/proof of concept. 

## Technical insights

### ZipBag "fuild-like" motion

To reproduce the oh-so-satisfying "fluid-like" motion of the zipbag, I used the ThreeJS CurveModifier example by [@Ada Rose Canon](https://twitter.com/lady_ada_king).
[Link to article by Ada Rose Canon](https://medium.com/samsung-internet-dev/curve-modifiers-in-three-js-1ada72c61677) - [Link to ThreeJS example](https://threejs.org/examples/#webgl_modifier_curve) - [Link to the OG Path Flow aka Mesh Path Deformation Modifier](https://github.com/zz85/threejs-path-flow)

Using the CurveModifier class was fairly easy and straightforward.

The curve fed to the CurveModifier is computed from the position of DOM elements. Meaning that it will automatically adujsts itself if those elements positions are changed (because of, for example, CSS modifications).

The trickiest was to adapt my vertex shader so it would not break the CurveModifier behavior. The modifier use the `onBeforeCompile` method to overide the vertex and fragment shader and attach to them its own logic. My vertex shader was missing the ThreeJS shader chunks inclusions on wich the modifier relies on. After adding [those three lines](https://github.com/TheoGil/panpan/blob/master/src/shaders/zipbag/vertex.vert#L5-L7) everything began working as expected!

The scroll position is used to update the offset of the mesh.

### The ingredients reveal

My original idea was to create a video to use it as an alpha mask within the fragment shader and use the scroll position to scrub through the video. Easy peasy.

I then realised that scrubbing through the video was not fluid at all and it visually looked like a BIG drop in the FPS, so I decided to generate the whole alpha mask animation procedurally in the fragment shader. It took me some times but that works very nicely and it save me the extra http request.

I then found out that the issue I was facing with the video scrubbing was caused by the video not having enough keyframes for the browser to be able to quickly scan through it.

I decided to keep the "all done in fragment" solution, but using a video would give way more artistic freedom for the designer to tweak and fine-tune every details of the transition.

[Link to a case study by Yuri Artiukh](https://medium.com/@akella/story-of-one-animation-webgl-and-not-webgl-c733c44f489e) - [Link to a deep dive post on video scrubbing by Abhishek Ghosh](https://www.ghosh.dev/posts/playing-with-video-scrubbing-animations-on-the-web/)
