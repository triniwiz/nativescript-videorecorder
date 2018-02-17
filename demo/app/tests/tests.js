var Videorecorder = require("nativescript-videorecorder").Videorecorder;
var videorecorder = new Videorecorder();

describe("greet function", function() {
    it("exists", function() {
        expect(videorecorder.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(videorecorder.greet()).toEqual("Hello, NS");
    });
});