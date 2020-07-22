# treechart

My take on building a tree chart. The build includes a starter CSS file, and two javascript versions for ES modules and current browsers. No serious attempt has been made towards ie11 compatibility.

## Installation

```shell
npm i --save @buckneri/treechart
```

## API

### Data frame schema

Receives a JSON object as described below:

```javascript
{
  series: [
    { color: string, label: string, value: number }
  ]
}
```

### Constructor

```javascript
const tree = new Treechart({
  container: document.getElementById("chart"),
  data: data,
  margin: { bottom: 20, left: 20, right: 20, top: 20 }
});
```

### Events

tree-selected - emitted when user clicks on category

### Methods

```javascript
tree.clearSelection();
// clears selection from chart elements

tree.data(nodes, links);
// stores and initialises data

tree.destroy();
// self-destruct

tree.draw();
// draws chart to DOM

tree.toString();
// serialises the internal data
```

### Properties

```javascript
tree.container;
// parent element for chart

tree.formatValue
// Intl.NumberFormat instance. Default is decimal

tree.h;
// height of chart

tree.locale
// locale for formatting values. Default is en-GB

tree.margin;
// defines the border zone around the canvas

tree.rh;
// relative height, height - margins

tree.rw;
// relative width, width - margins

tree.w;
// width of chart
```
