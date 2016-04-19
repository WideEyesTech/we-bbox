#Bbox library

FE Library to perform image annotations. Pretty barebones. Used at [Wide Eyes](http://wide-eyes.it).

## Usage

To start, call the Bbox constructor function passing an options object as the argument. This object shall include a reference to the DOM element that has to contain the annotator, as well as an img DOM element with the image you want to annotate:

` const bbox = Bbox({canvasContainer, image}) `

You can subscribe to annotations:

` bbox.subscribe((annotation) => console.log(annotation)) `

The annotation is an object with parameters x1, y1, x2, y2 corresponding to the coordinates of the upper left and bottom right corners of the bounding box. The callback gets called everytime the bbox is edited in some significant way.

Finally, you can remove the annotator by calling the dispose function:

` bbox.dispose() `


## Development

Webpack dev server: `npm start`
build for production: `npm run build`

## Dependencies
 RxJS: `npm install --save rx`
