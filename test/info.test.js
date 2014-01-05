process.env.NODE_ENV = 'test';

var fs = require('fs');
var MBTiles = require('..');
var assert = require('assert');
var fixtures = {
    plain_1: __dirname + '/fixtures/plain_1.mbtiles',
    empty: __dirname + '/fixtures/empty.mbtiles'
};

describe('info', function() {
    before(function(done) {
        try { fs.unlinkSync(fixtures.empty); } catch (err) {}
        done();
    });
    it('get metadata', function(done) {
        new MBTiles(fixtures.plain_1, function(err, mbtiles) {
            assert.ifError(err);

            mbtiles.getInfo(function(err, data) {
                assert.ifError(err);

                assert.deepEqual({
                    name: 'plain_1',
                    description: 'demo description',
                    version: '1.0.3',
                    scheme: 'tms',
                    minzoom: 0,
                    maxzoom: 4,
                    formatter: null,
                    center: [ 0, 7.500000001278025, 2 ],
                    bounds: [ -179.9999999749438, -69.99999999526695, 179.9999999749438, 84.99999999782301 ],

                    // These aren't part of TileJSON, but exist in an MBTiles file.
                    filesize: 561152,
                    type: 'baselayer',
                    id: 'plain_1',
                    basename: 'plain_1.mbtiles'
                }, data);

                done();
            });
        });
    });
    it('get/put metadata from empty file', function(done) {
        this.timeout(10e3);

        new MBTiles(fixtures.empty, function(err, mbtiles) {
            assert.ifError(err);

            mbtiles.getInfo(function(err, data) {
                assert.ifError(err);

                assert.deepEqual({
                    basename: "empty.mbtiles",
                    filesize: 0,
                    id: "empty",
                    scheme: "tms"
                }, data);

                mbtiles.putInfo({ version: '1.0.0' }, function(err) {
                    assert.ok(err);
                    assert.equal(err.message, 'MBTiles not in write mode');

                    mbtiles.startWriting(function(err) {
                        assert.ifError(err);

                        mbtiles.putInfo({ version: '1.0.0' }, function(err) {
                            assert.ifError(err);

                            mbtiles.stopWriting(function(err) {
                                assert.ifError(err);

                                mbtiles.getInfo(function(err, data) {
                                    assert.ifError(err);

                                    assert.deepEqual({
                                        basename: "empty.mbtiles",
                                        filesize: 0,
                                        id: "empty",
                                        scheme: "tms",
                                        version: "1.0.0"
                                    }, data);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
