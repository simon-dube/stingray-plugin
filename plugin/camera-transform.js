define((require) => {
    "use strict";

    const exports = require("exports");
    const cameraTransformApp = require("./camera-transform-app");
    
    document.title = "Camera Transform";
    document.getToolName = () => "Camera Transform";

    cameraTransformApp.run(document.getElementById('camera-transform'));
    exports.noAngular = true;
});