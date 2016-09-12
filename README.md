#Bbox library

FE Library to perform image annotations.

## Install

`npm i --save we-bbox`

## Usage

To start:

```javascript

  const bbox = Bbox({
    canvasContainer: <DOM element>,
    image: <DOM element>,
    onload?: <Function>
  })

```

`canvasContainer` is the dom element that shall contain the annotator.

`image` is the img dom element containing the image to annotate.

`onload` is an optional callback function.


You can subscribe to annotations:

```javascript

 bbox.subscribe((annotation: <Object>) => console.log(annotation))

```

`annotation` is an object with parameters x1, y1, x2, y2 corresponding to the coordinates of the upper left and bottom right corners of the bounding box.

The callback gets called everytime the bbox is edited in some significant way.


You can remove the annotator by calling the dispose function:

```javascript

 bbox.dispose()

 ```

This will destroy all content within the `canvasContainer`.

You can tell the library to set the bbox you want over the image:

```javascript
  bbox.setBbox({x1: 0, x2: 10, y1: 0, y2: 10})
```

## Development

Webpack dev server: `npm start`

build for production: `npm run build`
