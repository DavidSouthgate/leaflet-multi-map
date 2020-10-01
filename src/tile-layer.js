L.MultiMap.TileLayer = L.Class.extend({
    id: null,
    title: null,
    vanillaTileLayer: null,

    initialize: function(id = null, options = {}) {
        this.id = id ? id : this.id;
        this.title = options.title ? options.title : this.title;
        this.vanillaTileLayer = options.vanillaTileLayer ? options.vanillaTileLayer : this.vanillaTileLayer;
    }
});

L.MultiMap.tileLayer = function (id = null, options = {}) {
    return new L.MultiMap.TileLayer(id, options);
};
