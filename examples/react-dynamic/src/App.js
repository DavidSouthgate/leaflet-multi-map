import React from "react";
import styles from "./App.module.css";

import L from "leaflet"
import "leaflet/dist/leaflet.css";
import "proj4leaflet";
import "@davidsouthgate/leaflet-multi-map";
import "@davidsouthgate/leaflet-multi-map/dist/leaflet-multi-map.css";

// Hack to get round marker not showing when using leaflet css from npm
// https://github.com/PaulLeCam/react-leaflet/issues/453#issuecomment-410450387
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default class Test extends React.Component {
  componentDidMount() {
      const CENTER = [56.8, -3.4];
      const API_KEY = "LgUCghKqtwvZEASSCReMCCD9vpJlhrL9";
      const SERVICE_URL = "https://api.os.uk/maps/raster/v1/zxy";

      let multiMap = L.multiMap("map", {
          center: CENTER,
          zoom: 7
      });

      multiMap.addTileLayer(
          L.MultiMap.tileLayer("osOutdoor", {
              title: "Ordnance Survey (Outdoor)",
              vanillaTileLayer: L.tileLayer(SERVICE_URL + '/Outdoor_27700/{z}/{x}/{y}.png?key=' + API_KEY, {
                  attribution: "Contains OS data &copy; Crown copyright and database rights " + new Date().getFullYear()
              })
          })
      );

      multiMap.addMap(
          L.MultiMap.map("map27700", {
              tileLayerIds: [
                  "osOutdoor"
              ],
              zoomOffset: 7,
              vanillaOptions: {
                  crs: new L.Proj.CRS('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs', {
                      resolutions: [ 896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75 ],
                      origin: [ -238375.0, 1376256.0 ]
                  }),
              }
          })
      );

      setTimeout(function() {

          multiMap.addTileLayer(
              L.MultiMap.tileLayer("osLeisure", {
                  title: "Ordnance Survey (Leisure)",
                  vanillaTileLayer: L.tileLayer(SERVICE_URL + '/Leisure_27700/{z}/{x}/{y}.png?key=' + API_KEY, {
                      attribution: "Contains OS data &copy; Crown copyright and database rights " + new Date().getFullYear()
                  })
              }), "map27700"
          );

          multiMap.addTileLayer(
              L.MultiMap.tileLayer("openStreetMap", {
                  title: "OpenStreetMap",
                  vanillaTileLayer: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
                  })
              })
          );

          multiMap.addTileLayer(
              L.MultiMap.tileLayer("openTopoMap", {
                  title: "OpenTopoMap",
                  vanillaTileLayer: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                      attribution: "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org\">SRTM</a> | Map style: &copy; <a href=\"https://opentopomap.org\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\">CC-BY-SA</a>)"
                  })
              })
          );

          multiMap.addMap(
              L.MultiMap.map("map3857", {
                  tileLayerIds: [
                      "openStreetMap",
                      "openTopoMap"
                  ],
                  zoomOffset: 0
              })
          );

          console.log(multiMap.maps[0]);
      }, 3000);

      let cities = L.layerGroup(
          [
              L.marker([57.1498817, -2.1950666]).bindPopup("Aberdeen"),
              L.marker([56.4745806, -3.0368723]).bindPopup("Dundee"),
              L.marker([55.9544530, -3.1893327]).bindPopup("Edinburgh"),
              L.marker([55.8554403, -4.3024976]).bindPopup("Glasgow"),
              L.marker([57.4679914, -4.2568770]).bindPopup("Inverness"),
              L.marker([56.3904758, -3.4842713]).bindPopup("Perth"),
              L.marker([56.1168820, -3.9360940]).bindPopup("Stirling"),
          ]
      );

      multiMap.addOverlay("Cities", cities, {checked: true});
  }

  render() {
    return (
        <div>
          <div id="map" className={styles.map}/>
        </div>
    )
  }
}
