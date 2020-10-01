L.MultiMap.Map = L.Class.extend({
    id: null,
    tileLayerIds: [],
    zoomOffset: 0,
    vanillaOptions: {},
    _overlayMaps: {},
    _vanillaMap: null,
    _vanillaTileLayers: null,
    _vanillaLayersControl: null,

    initialize: function(id = null, options = {}) {
        this.id = id;
        this.tileLayerIds = options.tileLayerIds ? options.tileLayerIds : this.tileLayerIds;
        this.zoomOffset = options.zoomOffset ? options.zoomOffset : this.zoomOffset;
        this.vanillaOptions = options.vanillaOptions ? options.vanillaOptions : this.vanillaOptions;
    }
});

L.MultiMap.map = function (id = null, options = {}) {
    return new L.MultiMap.Map(id, options);
};
