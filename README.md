#Bbox library

FE Library to perform image annotations. Pretty barebones. Used at [Wide Eyes](http://wide-eyes.it).

## Install

`npm i --save we-bbox`

## Usage

To start:

` const bbox = Bbox({canvasContainer: <DOM element>, image: <DOM element>, onload?: <Function>}) `

`canvasContainer` is the dom element that shall contain the annotator.

`image` is the img dom element containing the image to annotate.

`onload` is an optional callback function.

You can subscribe to annotations, as follows:

` bbox.subscribe((annotation: <Object>) => console.log(annotation)) `

`annotation` is an object with parameters x1, y1, x2, y2 corresponding to the coordinates of the upper left and bottom right corners of the bounding box.

The callback gets called everytime the bbox is edited in some significant way.

Finally, you can remove the annotator by calling the dispose function:

` bbox.dispose() `

This will destroy all content within the `canvasContainer`.


## Development

Webpack dev server: `npm start`
build for production: `npm run build`
