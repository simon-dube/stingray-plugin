 define((require) => {
    'use strict';

    const m = require('components/mithril-ext');
    const mathUtils = require('common/math-utils');
    const engineViewportService = require('services/engine-viewport-service');
    const engineViewport = require("common/engine-viewport");
    const vector = require("common/vector");

    class CameraTransformModel {
        constructor() {
            this.position = {
                X: 0,
                Y: 0,
                Z: 0
            }
            this.rotation = {
                X: 0,
                Y: 0,
                Z: 0
            }
            this.rotationDegrees = {
                X: 0,
                Y: 0,
                Z: 0
            }

            engineViewportService.getActiveCameraForViewport("LevelEditingViewport1")
            .then(camera => {
                camera.on("StateChanged", state => this.updateState(state[1].Arg)
                .then(() => m.utils.redraw("Camera value updated")));

                camera.invokeMethod("GetState", [], {}).then(state => this.updateState(state));
            })
        }

        updateState(state){
            return Promise.resolve(state)
            .then(state => {
                this.state = state;
                this.position = state.position;
                return state.rotation.invokeMethod("get_EulerXyz", [], {});
            }).then(rotation => {
                this.rotation = rotation;
                this.setDegreesRotation(this.rotation);
            });
        }

        setRadiansRotation(vector){
            this.rotation.X = mathUtils.toRadians(vector.X);
            this.rotation.Y = mathUtils.toRadians(vector.Y);
            this.rotation.Z = mathUtils.toRadians(vector.Z);
        }

        setDegreesRotation(vector){
            this.rotationDegrees.X = mathUtils.toDegrees(vector.X);
            this.rotationDegrees.Y = mathUtils.toDegrees(vector.Y);
            this.rotationDegrees.Z = mathUtils.toDegrees(vector.Z);
        }

        pushState(changed){
            return Promise.resolve()
            .then(() => {
                if(changed.indexOf("rotation") >= 0){
                    this.setRadiansRotation(this.rotationDegrees);
                    this.state.rotation.invokeMethod("set_EulerXyz", [this.rotation], {});
                }else{
                    this.state[changed] = this[changed];
                }
            })
            .then(() => engineViewportService.getActiveCameraForViewport("LevelEditingViewport1"))
            .then(camera => camera.invokeMethod("SetState", [this.state], {}));
        }

        pushFullState(state){
            return engineViewportService.getActiveCameraForViewport("LevelEditingViewport1")
            .then(camera => {
                this.state.position.X = state.position.X;
                this.state.position.Y = state.position.Y;
                this.state.position.Z = state.position.Z;

                this.state.rotation.X = state.rotation.X;
                this.state.rotation.Y = state.rotation.Y;
                this.state.rotation.Z = state.rotation.Z;
                this.state.rotation.W = state.rotation.W;

                return camera.invokeMethod("SetState", [this.state], {});
            })
        }
   
        propertyModel(path, pathExtension, onSet) {
            function setPropertyModelValue(path, value, cameraTransformModel){
                if(path.indexOf("rotation") >= 0){
                    if(value < -180){
                        value = 360 + value;
                    }
                    else if(value > 180){
                        value = value - 360;
                    }
                    _.set(cameraTransformModel, path, value%360);
                }
                else{
                    _.set(cameraTransformModel, path, value);                        
                }
            }

            let cameraTransformModel = this;
            let model = function (value) {
                // value = _.isFinite(value) ? mathUtil.numberTruncate(value, 4) : value;
                if (arguments.length) {
                    if (pathExtension != null && pathExtension.length > 0) {
                        pathExtension.forEach(extension => {
                            _.set(cameraTransformModel, `${path}.${extension}`, value);
                            cameraTransformModel.pushState(`${path}.${extension}`);

                            if (onSet) {
                                onSet(value);
                            }
                        });
                    }
                    else {
                        setPropertyModelValue(path, value, cameraTransformModel);
                        cameraTransformModel.pushState(path);
                        
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
            model.setTransientValue = function (newValue) {
                // newValue = _.isFinite(newValue) ? mathUtil.numberTruncate(newValue, 4) : newValue;
                if (pathExtension != null && pathExtension.length > 0) {
                    pathExtension.forEach(extension => {
                        _.set(cameraTransformModel, `${path}.${extension}`, newValue);
                        cameraTransformModel.pushState(`${path}.${extension}`);
                        if (onSet) {
                            onSet(newValue);
                        }
                    });
                }
                else {
                    setPropertyModelValue(path, newValue, cameraTransformModel);
                    cameraTransformModel.pushState(path);
                    if (onSet) {
                        onSet(newValue);
                    }
                }
            };
            model.commitValue = function (originalValue, newValue) {
                // newValue = _.isFinite(newValue) ? mathUtil.numberTruncate(newValue, 4) : newValue;
                if (pathExtension != null && pathExtension.length > 0) {
                    pathExtension.forEach(extension => {
                        _.set(cameraTransformModel, `${path}.${extension}`, newValue);
                        cameraTransformModel.pushState(`${path}.${extension}`);
                        
                        if (onSet) {
                            onSet(newValue);
                        }
                    });
                }
                else {
                    setPropertyModelValue(path, newValue, cameraTransformModel);
                    cameraTransformModel.pushState(path);
                    
                    if (onSet) {
                        onSet(newValue);
                    }
                }
            };
            return model;
        }
    }

    return CameraTransformModel;
})
