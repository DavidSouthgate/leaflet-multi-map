L.MultiMap.Map = L.Class.extend({
    // Public Properties:
    //      id                    {string}                  The unique identifier for this map. Must be a unique DOM id.
    //      tileLayerIds          [{string}]                The IDs of the tile layers that should use this map
    //      zoomOffset            {number}                  The difference in zoom for this map from the multimap zoom.
    //      vanillaOptions        {object}                  Options which should be passed to the L.Map instance
    //      vanillaMap            {L.Map}                   The vanilla leaflet map instance
    // Private Properties:
    //      _overlayMaps          {<Name> -> L.LayerGroup}  Overlays which have been added to this map
    //      _tileLayerTitles      [{string}]                The names of the tile layers that should use this map
    //      _vanillaLayersControl {L.Control.Layers}        The layer controls used on this map
    //      _vanillaTileLayers    {<Name> -> L.TileLayer}   A map from a tile layer's name to the vanilla leaflet tile layer

    initialize: function(id = null, options = {}) {
        this.id = id ? id : null;
        this.tileLayerIds = options.tileLayerIds ? options.tileLayerIds : [];
        this.zoomOffset = options.zoomOffset ? options.zoomOffset : 0;
        this.vanillaOptions = options.vanillaOptions ? options.vanillaOptions : {};
        this.vanillaMap = null;
        this._overlayMaps = {};
        this._tileLayerTitles = [];
        this._vanillaLayersControl = null;
        this._vanillaTileLayers = {};
    },

    _hasAnyLayer() {
        let flag = false
        for(const vanillaTileLayer of Object.values(this._vanillaTileLayers)) {
            if(this.vanillaMap.hasLayer(vanillaTileLayer)) {
                flag = true;
            }
        }
        return flag;
    },
});

L.MultiMap.map = function (id = null, options = {}) {
    return new L.MultiMap.Map(id, options);
};
