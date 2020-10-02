L.MultiMap.Map = L.Class.extend({
    initialize: function(id = null, options = {}) {
        this.id = id ? id : null;
        this.tileLayerIds = options.tileLayerIds ? options.tileLayerIds : [];
        this.zoomOffset = options.zoomOffset ? options.zoomOffset : 0;
        this.vanillaOptions = options.vanillaOptions ? options.vanillaOptions : {};
        this._overlayMaps = {};
        this._vanillaMap = null;
        this._vanillaTileLayers = null;
        this._vanillaLayersControl = null;
    }
});

L.MultiMap.map = function (id = null, options = {}) {
    return new L.MultiMap.Map(id, options);
};
