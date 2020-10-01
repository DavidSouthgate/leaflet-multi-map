# leaflet Multi Map
## Installation
Leaflet Multi Map requires Leaflet to be installed as a peer dependency.

### With Imports
```
npm install leaflet
npm install @davidsouthgate/leaflet-multi-map
```

```
import L from "leaflet"
import "leaflet/dist/leaflet.css";
import "@davidsouthgate/leaflet-multi-map";
import "@davidsouthgate/leaflet-multi-map/dist/leaflet-multi-map.css";
```

### Without Imports
Build the project (using below instructions) and copy the leaflet-multi-map.min.js to your server.

```html
<head>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="leaflet-multi-map.min.js"></script>
</head>
```

## Build
To build run:

```
npm install
npm run build
```
