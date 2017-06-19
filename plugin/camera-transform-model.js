 define((require) => {
    'use strict';

    const m = require('components/mithril-ext');
    const mathUtil = require('common/math-utils');
    const engineViewportService = require('services/engine-viewport-service');
    const engineViewport = require("common/engine-viewport");

    class CameraTransformModel {
        constructor() {
            engineViewportService.getActiveCameraForViewport("LevelEditingViewport1")
            .then(camera => {
                camera.on("StateChanged", state => {
                    this.state.position = state[1].Arg.position;
                    this.state.rotation = state[1].Arg.rotation;
                    m.redraw();
                })

                camera.invokeMethod("GetState", [], {}).then(state => {
                    this.state = state;
                })
            })
        }

        pushState(){
            engineViewportService.getActiveCameraForViewport("LevelEditingViewport1")
            .then(camera => {
                camera.invokeMethod("SetState", [this.state], {});
            })
        }
   
        propertyModel(path, pathExtension, onSet) {
            let cameraTransformModel = this;
            let model = function (value) {
                value = _.isFinite(value) ? mathUtil.numberTruncate(value, 4) : value;
                if (arguments.length) {
                    if (pathExtension != null && pathExtension.length > 0) {
                        pathExtension.forEach(extension => {
                            _.set(cameraTransformModel, `${path}.${extension}`, value);
                            cameraTransformModel.pushState();

                            if (onSet) {
                                onSet(value);
                            }
                        });
                    }
                    else {
                        _.set(cameraTransformModel, path, value);
                        cameraTransformModel.pushState();
                        
                        if (onSet) {
                            onSet(value);
                        }
                    }
                  }
                if (model.transient != null) {
                    return model.transient;
                }
                if (pathExtension != null && pathExtension.length > 0) {
                    return _.get(cameraTransformModel, `${path}.${pathExtension[0]}`);
                }
                else {
                    return _.get(cameraTransformModel, path);
                }
            };
            // model.transient = null;
            model.setTransientValue = function (newValue) {
                newValue = _.isFinite(newValue) ? mathUtil.numberTruncate(newValue, 4) : newValue;
                if (pathExtension != null && pathExtension.length > 0) {
                    pathExtension.forEach(extension => {
                        _.set(cameraTransformModel, `${path}.${extension}`, newValue);
                        cameraTransformModel.pushState();
                        if (onSet) {
                            onSet(newValue);
                        }
                    });
                }
                else {
                    _.set(cameraTransformModel, path, newValue);
                    cameraTransformModel.pushState();
                    if (onSet) {
                        onSet(newValue);
                    }
                }
            };
            model.commitValue = function (originalValue, newValue) {
                newValue = _.isFinite(newValue) ? mathUtil.numberTruncate(newValue, 4) : newValue;
                if (pathExtension != null && pathExtension.length > 0) {
                    pathExtension.forEach(extension => {
                        _.set(cameraTransformModel, `${path}.${extension}`, newValue);
                        cameraTransformModel.pushState();
                        
                        if (onSet) {
                            onSet(newValue);
                        }
                    });
                }
                else {
                    _.set(cameraTransformModel, path, newValue);
                    cameraTransformModel.pushState();
                    
                    if (onSet) {
                        onSet(newValue);
                    }
                }
                // model.transient = null;
            };
            return model;
        }
    }

    return CameraTransformModel;
})
