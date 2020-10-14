import cloneLayer from "@davidsouthgate/leaflet-clonelayer";

L.MultiMap = L.Class.extend({
    // Public Properties:
    //      id                  {string}                    The unique identifier used within the DOM for this multi map.
    //      tileLayers          [{L.MultiMap.TileLayer}]    An array of tile layers that are used on the multimap
    //      maps                [{L.MultiMap.Map}]          An array of maps that are used in the multimap
    //      center              [{number}, {number}]        The initial center position
    //      zoom                {number}                    The initial base zoom level
    // Private Properties:
    //      _mapIds             [{string}]                  An array of mapIds. ALWAYS equal in length to maps.
    //      _currentMapId       {string}                    The ID of the currently displayed map
    //      _currentMapIndex    {number}                    The index of the currently displayed map.
    //                                                      I.e. currentMap = this.maps[_currentMapIndex]
    //      _containerElement   {HTMLElement}               The root container DOM element of the multimap
    //      _overlays           [{object}]                  The overlays that have been added to the multi map.

    initialize: function(id = null, options = {}) {
        this.id = id;
        this.tileLayers = options.tileLayers ? options.tileLayers : [];
        this.maps = options.maps ? options.maps : [];
        this.center = options.center;
        this.zoom = options.zoom ? options.zoom : 0;
        this._mapIds = this.maps.map(map => map.id);
        this._currentMapId = null;
        this._currentMapIndex = null;
        this._containerElement = document.getElementById(id);
        this._overlays = [];
        if(!this._containerElement) {
            console.error(`Could not create Leaflet Multi Map as element with ID ${this.id} could not be found`);
            return;
        }

        // TODO. Needed?
        this._onBaseLayerChange = this._onBaseLayerChange.bind(this);
        this._onOverlayAdd = this._onOverlayAdd.bind(this);
        this._onOverlayRemove = this._onOverlayRemove.bind(this);
        this._onMoveEnd = this._onMoveEnd.bind(this);

        this._initializeMultiMap();

        if(this.maps.length > 0) {
            this._enableMap(this.maps[0].id)
        }
    },

    _initializeMultiMap: function () {
        this._containerElement.className = (this._containerElement.className ? this._containerElement.className + " " : "") + "leaflet-multi-map-container";
        for(const map of this.maps) {
            this._initializeMap(map);
        }
    },

    /**
     * @param map
     * @private
     */
    _initializeMap: function (map) {
        for(const tileLayer of this.tileLayers) {
            this._addTileLayerToMap(map, tileLayer);
        }
        this._createMap(map);
    },

    //=================================
    // Public
    //=================================

    /**
     * Checks whether the multi map already contains a map with a given ID
     * @param mapId {string} The map ID
     * @returns {boolean}
     */
    hasMap: function (mapId) {
        return this._mapIds.includes(mapId)
    },

    getTileLayer: function (tileLayerId) {
        for(const tileLayer of this.tileLayers) {
            if (tileLayerId && tileLayer.id === tileLayerId) {
                return tileLayer;
            }
        }
        return null;
    },

    hasTileLayer: function (tileLayerId) {
        if(!tileLayerId) return false;
        for(const tileLayer of this.tileLayers) {
            if(tileLayer.id === tileLayerId) {
                return true;
            }
        }
        return false;
    },

    /**
     * Add a new map to the multi map
     * @param map {L.MultiMap.Map}
     */
    addMap: function (map) {
        if(this.hasMap(map.id)) {
            console.error("Map with ID '" + map.id + "' already exists in the multi map with ID '" + this.id + "'")
            return
        }
        this.maps.push(map);
        this._mapIds.push(map.id);
        this._initializeMap(map);
        for(const overlay of this._overlays) {
            this._addOverlayToMap(map, overlay);
        }
        if(!this._currentMapId) {
            this._enableMap(map.id);
        }
    },

    /**
     * Adds a new tile layer to the multimap
     * @param tileLayer
     * @param mapId
     */
    addTileLayer: function (tileLayer, mapId = null) {
        this.tileLayers.push(tileLayer);
        for(const map of this.maps) {
            if(mapId && map.id === mapId) {
                map.tileLayerIds.push(tileLayer.id);
            }
            this._addTileLayerToMap(map, tileLayer);
        }
    },

    addOverlay: function(name, layer, options = {}) {
        const overlay = {
            name,
            layer: layer,
            options: options
        };
        this._overlays.push(overlay);
        for(const map of this.maps) {
            this._addOverlayToMap(map, overlay);
        }
    },

    /**
     * Remove all existing overlays from the map
     */
    removeAllOverlays: function() {
        for(const map of this.maps) {
            for(const layer of Object.values(map._overlayMaps)) {
                map.vanillaMap.removeLayer(layer);
                map._vanillaLayersControl.removeLayer(layer);
            }
        }
    },

    //=================================
    // Private
    //=================================

    /**
     * Create a new map DOM element and setup events
     * @param map               The MultiMap Map
     * @private
     */
    _createMap: function (map) {
        let mapElement = document.createElement("div");
        mapElement.id = map.id;
        mapElement.className = "leaflet-multi-map";
        this._containerElement.appendChild(mapElement);

        map.vanillaMap = L.map(map.id, this._getMapVanillaOptions(map));
        map.vanillaMap.on("baselayerchange", this._onBaseLayerChange);
        map.vanillaMap.on("overlayadd", this._onOverlayAdd);
        map.vanillaMap.on("overlayremove", this._onOverlayRemove);
        map.vanillaMap.on("moveend", (e) => this._onMoveEnd(e, map));

        map._vanillaLayersControl = L.control.layers(map._vanillaTileLayers).addTo(map.vanillaMap);
    },

    /**
     * Adds a given tile layer to the map
     * @param map       A MultiMap Map
     * @param tileLayer A MultiMap TileLayer
     * @private
     */
    _addTileLayerToMap: function (map, tileLayer) {
        if(!(tileLayer.title in map._vanillaTileLayers)) {
            let vanillaTileLayer;
            if(map.tileLayerIds.includes(tileLayer.id)) {
                vanillaTileLayer = tileLayer.vanillaTileLayer;
                map._tileLayerTitles.push(tileLayer.title);
            } else {
                vanillaTileLayer = L.tileLayer("", {});
            }
            map._vanillaTileLayers[tileLayer.title] = vanillaTileLayer;

            if(map._vanillaLayersControl) {
                map._vanillaLayersControl.addBaseLayer(vanillaTileLayer, tileLayer.title);
            }
        }
    },

    _getMapVanillaOptions: function (map) {
        let activeLayers = [];
        if(this.maps.length > 0 && this.maps[0] === map) {
            if(map._tileLayerTitles.length === 0) {
                console.error("Map with id " + map.id + " must have at least one layer");
            } else {
                activeLayers = [map._vanillaTileLayers[map._tileLayerTitles[0]]]
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
                if(!map._hasAnyLayer() && map._tileLayerTitles.length > 0) {
                    map.vanillaMap.addLayer(map._vanillaTileLayers[map._tileLayerTitles[0]]);
                }
                map.vanillaMap.invalidateSize();
            }
        }
    },

    /**
     * @param map {L.MultiMap.Map}
     * @param overlay {object} The details of the overlay
     * @private
     */
    _addOverlayToMap: function (map, overlay) {
        let checked = !!overlay.options.checked;
        let name = overlay.name;
        let l = cloneLayer(overlay.layer);
        if(checked) {
            map.vanillaMap.addLayer(l);
        }
        if(name) {
            map._vanillaLayersControl.addOverlay(l, name);
        }
        map._overlayMaps[name] = l;
    },

    //=================================
    // Events
    //=================================

    _onBaseLayerChange: function (event) {
        let selectedMapId = null;

        for(const map of this.maps){
            const layers = Object.entries(map._vanillaTileLayers)
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
        for (const [layerTitle, layer] of Object.entries(map._vanillaTileLayers)) {
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
