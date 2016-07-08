var MBTiles = function (fileName) {
    // for opening a background db:
    this.db = window.sqlitePlugin.openDatabase({name: fileName, bgType: 1});
};

MBTiles.prototype.metadataQuery = "SELECT name, value FROM METADATA;";
MBTiles.prototype.minZoomQuery = "SELECT name, value FROM METADATA WHERE name = 'minzoom';";
MBTiles.prototype.maxZoomQuery = "SELECT name, value FROM METADATA WHERE name = 'maxzoom';";
MBTiles.prototype.tileQuery = "SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?;";

MBTiles.prototype.doQuery = function (query, params, onSuccess, onError) {
    this.db.executeSql(query, params, onSuccess, onError);
};

MBTiles.prototype.getMetadata = function (onSuccess, onError) {
    var success = function (res) {
        var ret = {};
        for (var i = 0; i < res.rows.length; i++) {
            var row = res.rows.item(i);
            ret[row['name']] = row['value'];
        }
        onSuccess(ret);
    };
    this.doQuery(this.metadataQuery, null, success, onError);
};

MBTiles.prototype.getMinZoom = function (onSuccess, onError) {
    var success = function (res) {
        onSuccess(res.rows.item(0)['value']);
    };
    this.doQuery(this.minZoomQuery, null, success, onError);
};

MBTiles.prototype.getMaxZoom = function (onSuccess, onError) {
    var success = function (res) {
        onSuccess(res.rows.item(0)['value']);
    };
    this.doQuery(this.maxZoomQuery, null, success, onError);
};

MBTiles.prototype.getTile = function (pos, onSuccess, onError) {
    var success = function (res) {
        onSuccess(res.rows.item(0));
    };
    this.doQuery(this.tileQuery, [pos.z, pos.x, pos.y], success, onError);
};

L.TileLayer.MBTilesPlugin = L.TileLayer.extend(
    {
        mbTilesPlugin: null,
        mbTilesMetadata: null,
        base64Prefix: null,


        initialize: function (mbTilesPlugin, options, callback) {
            console.log("initialize");
            this.mbTilesPlugin = mbTilesPlugin;
            L.Util.setOptions(this, options);

            var tileLayer = this;
            var minZoom = 0;
            var maxZoom = 0;

            console.log("initialize2");
            mbTilesPlugin.getMinZoom(function (result) {
                minZoom = result;
                console.log("getMinZoom --" + minZoom + "--");
                mbTilesPlugin.getMaxZoom(function (result) {
                    maxZoom = result;
                    console.log("getMaxZoom --" + maxZoom + "--");
                    mbTilesPlugin.getMetadata(function (result) {
                        console.log("getMetadata");
                        mbTilesMetadata = result;
                        L.Util.setOptions(tileLayer,
                            {
                                minZoom: minZoom,
                                maxZoom: maxZoom
                            });

                        if (mbTilesMetadata.format) {
                            base64Prefix = "data:image/" + mbTilesMetadata.format + ";base64,";
                        }
                        else {
                            // assuming that tiles are in png as default format ...
                            base64Prefix = "data:image/png;base64,";
                        }
                        callback(tileLayer);
                    });
                });
            });
        },

        getTileUrl: function (tilePoint, zoom, tile) {
            this._adjustTilePoint(tilePoint);
            var z = this._getZoomForUrl();
            var x = tilePoint.x;
            var y = tilePoint.y;
            this.mbTilesPlugin.getTile({z: z, x: x, y: y},
                function (result) {
                    tile.src = base64Prefix + result.tile_data;
                },
                function (error) {
                    console.log("failed to load tile " + JSON.stringify(error));
                });
        },

        _loadTile: function (tile, tilePoint, zoom) {
            tile._layer = this;
            tile.onload = this._tileOnLoad;
            tile.onerror = this._tileOnError;
            this.getTileUrl(tilePoint, this.options.zoom, tile);
        }

    }
);
