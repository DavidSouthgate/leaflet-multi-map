L.MultiMap.TileLayer = L.Class.extend({
    // Public Properties:
    //      id                  {string}            The unique identifier of this tile layer
    //      title               {string}            The title of this tile layer
    //      vanillaTileLayer    {L.TileLayer}       The vanilla tile layer which this instance represents.

    initialize: function(id = null, options = {}) {
        this.id = id ? id : null;
        this.title = options.title ? options.title : null;
        this.vanillaTileLayer = options.vanillaTileLayer ? options.vanillaTileLayer : null;
    }
});

L.MultiMap.tileLayer = function (id = null, options = {}) {
    return new L.MultiMap.TileLayer(id, options);
};
