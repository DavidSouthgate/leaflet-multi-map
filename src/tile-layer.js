L.MultiMap.TileLayer = L.Class.extend({
    initialize: function(id = null, options = {}) {
        this.id = id ? id : null;
        this.title = options.title ? options.title : null;
        this.vanillaTileLayer = options.vanillaTileLayer ? options.vanillaTileLayer : null;
    }
});

L.MultiMap.tileLayer = function (id = null, options = {}) {
    return new L.MultiMap.TileLayer(id, options);
};
