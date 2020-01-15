declare var android: any, co: any;
const superProto = (android as any).app.Application.prototype;

(android as any).app.Application.extend('co.fitcom.nativescript.demo.Application', {
    interfaces: [co.fitcom.fancycamera.CameraProvider],
    onCreate: function () {
        superProto.onCreate.call(this);
    },
    attachBaseContext: function (base) {
        superProto.attachBaseContext.call(this, base);
    },
    getCameraXConfig() {
        return co.fitcom.fancycamera.FancyCamera.defaultConfig(this)
    }
});
