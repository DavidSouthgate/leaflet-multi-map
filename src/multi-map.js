import cloneLayer from "@davidsouthgate/leaflet-clonelayer";

L.MultiMap = L.Class.extend({
    initialize: function(id = null, options = {}) {
        this.id = id;
        this.tileLayers = options.tileLayers ? options.tileLayers : [];
        this.maps = options.maps ? options.maps : [];
        this.center = options.center;
        this.zoom = options.zoom ? options.zoom : 0;
        this._currentMapId = null;
        this._currentMapIndex = null;

        // TODO. Needed?
        this._onBaseLayerChange = this._onBaseLayerChange.bind(this);
        this._onOverlayAdd = this._onOverlayAdd.bind(this);
        this._onOverlayRemove = this._onOverlayRemove.bind(this);
        this._onMoveEnd = this._onMoveEnd.bind(this);

        this._constructMapVanillaTileLayers();
        this._constructVanillaMaps();

        if(this.maps.length > 0) {
            this._enableMap(this.maps[0].id)
        }
    },

    addOverlay: function(name, layer, options = {}) {
        let checked = !!options.checked;
        for(const map of this.maps) {
            let l = cloneLayer(layer);
            if(checked) {
                map.vanillaMap.addLayer(l);
            }
            map.vanillaLayersControl.addOverlay(l, name);
            map._overlayMaps[name] = l;
        }
    },

    _constructMapVanillaTileLayers: function () {
        for(const map of this.maps) {
            map.vanillaTileLayers = {};
            map.tileLayerTitles = [];
            for(const tileLayer of this.tileLayers) {
                if(map.tileLayerIds.includes(tileLayer.id)) {
                    map.vanillaTileLayers[tileLayer.title] = tileLayer.vanillaTileLayer;
                    map.tileLayerTitles.push(tileLayer.title);
                } else {
                    map.vanillaTileLayers[tileLayer.title] = L.tileLayer("", {title: "test"})
                }
            }
        }
    },

    _constructVanillaMaps: function () {
        let containerElement = document.getElementById(this.id);
        if(!containerElement) {
            console.error(`Could not create Leaflet Multi Map as element with ID ${this.id} could not be found`);
            return;
        }
        containerElement.className = (containerElement.className ? containerElement.className + " " : "") + "leaflet-multi-map-container";
        for(const map of this.maps) {
            let mapElement = document.createElement("div");
            mapElement.id = map.id;
            mapElement.className = "leaflet-multi-map";
            containerElement.appendChild(mapElement);

            map.vanillaMap = L.map(map.id, this._getMapVanillaOptions(map));
            map.vanillaMap.on("baselayerchange", this._onBaseLayerChange);
            map.vanillaMap.on("overlayadd", this._onOverlayAdd);
            map.vanillaMap.on("overlayremove", this._onOverlayRemove);
            map.vanillaMap.on("moveend", (e) => this._onMoveEnd(e, map));

            map.vanillaLayersControl = L.control.layers(map.vanillaTileLayers).addTo(map.vanillaMap);
        }
    },

    _getMapVanillaOptions: function (map) {
        let activeLayers = [];
        if(this.maps.length > 0 && this.maps[0] === map) {
            if(map.tileLayerTitles.length === 0) {
                console.error("Map with id " + map.id + " must have at least one layer");
            } else {
                activeLayers = [map.vanillaTileLayers[map.tileLayerTitles[0]]]
            }
        }

        return {
            ...map.vanillaOptions,
            zoom: this.zoom - map.zoomOffset,
            center: this.center,
            layers: activeLayers
        };
    },

    _enableMap: function (mapId) {
        for(const map of this.maps) {
            const element = document.getElementById(map.id);
            if(map.id !== mapId) {
                element.style.display = "none";
            } else {
                element.style.display = "inline";
                this._currentMapId = mapId;
                this._currentMapIndex = this.maps.indexOf(map);
                map.vanillaMap.invalidateSize();
            }
        }
    },

    //=================================
    // Events
    //=================================

    _onBaseLayerChange: function (event) {
        let selectedMapId = null;

        for(const map of this.maps){
            const layers = Object.entries(map.vanillaTileLayers)
                .filter(entry => entry[0] === event.name);
            if(layers.length === 0) continue;
            const layerTitle = layers[0][0];
            const layer = layers[0][1];

            if(layer._url !== "") {
                selectedMapId = map.id;
            }
            if(map.id !== this._currentMapId) {
                this._changeMapLayer(map, layerTitle);
                this._showMapLayerControls(map);
            }
        }

        if(selectedMapId === null) return;
        this._enableMap(selectedMapId);
    },

    _onOverlayAdd: function (event) {
        for(const map of this.maps) {
            let layer = map._overlayMaps[event.name];
            map.vanillaMap.addLayer(layer);
        }
    },

    _onOverlayRemove: function (event) {
        for(const map of this.maps) {
            const layer = map._overlayMaps[event.name];
            map.vanillaMap.removeLayer(layer);
        }
    },

    _onMoveEnd: function (event, map) {
        if(map.id !== this._currentMapId) return;
        const currentZoomOffset = this.maps[this._currentMapIndex].zoomOffset;

        for(const otherMap of this.maps) {
            if(otherMap.id !== this._currentMapId) {
                const zoomOffset = otherMap.zoomOffset - currentZoomOffset;
                otherMap.vanillaMap.setView(event.target.getCenter(), event.target.getZoom() - zoomOffset);
            }
        }
    },

    _changeMapLayer: function (map, newLayerTitle) {
        for (const [layerTitle, layer] of Object.entries(map.vanillaTileLayers)) {
            if(layerTitle === newLayerTitle) {
                map.vanillaMap.addLayer(layer);
            } else {
                map.vanillaMap.removeLayer(layer);
            }
        }
    },

    _showMapLayerControls: function (map) {
        const mapElement = document.getElementById(map.id);
        const controlElements = mapElement.getElementsByClassName("leaflet-control-layers leaflet-control");
        for(const controlElement of controlElements) {
            controlElement.classList.add("leaflet-control-layers-expanded");
        }
    }
});

L.multiMap = function(id = null, options = {}) {
    return new L.MultiMap(id, options);
};
