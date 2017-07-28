define((require) => {
    'use strict';

    const stingray = require('stingray');
    const m = require('components/mithril-ext');
    const propertyTransform = require('properties/property-transform');

    const PropertyEditor = require('properties/property-editor-component');
    const PropertyDocument = require('properties/property-document');
    const props = require('properties/property-editor-utils');
    const mathUtils = require("common/math-utils")

    const Spinner = require('components/spinner');
    const Button = require('components/button');

    const CameraTransformModel = require('./camera-transform-model');
    const hostService = require("services/host-service")
    
    const DEFAULT_CAMERA_TRANSFORM = {
        position:{
            X: 0,
            Y: 0,
            Z: 0
        },
        rotation: {
            X: 0,
            Y: 0,
            Z: 0,
            W: 0
        }
    }

    class CameraTransformApp {
        constructor(){
            this.model = new CameraTransformModel();
        }
        
        /**
         * Render the viewer with the camera transform.
         */
        render () {
            return m.layout.vertical({}, [
                PropertyEditor.component({document: 
                new PropertyDocument([
                    props.category("Camera Transform", {flex: 'flex-33-66'}, [
                        props.helpers.vector3("Position", [this.model.propertyModel('position.X'), this.model.propertyModel('position.Y'), this.model.propertyModel('position.Z')], {decimal: 10, increment: 0.5}),
                        props.helpers.rotation("Rotation", [this.model.propertyModel('rotationDegrees.X'), this.model.propertyModel('rotationDegrees.Y'), this.model.propertyModel('rotationDegrees.Z')], {decimal: 3, increment: 0.5})
                    ])
                ])}),
                m.layout.container({}, [
                m.layout.element({}, [
                    Button.component(this.createButton("Copy Camera Transform", () => this.sendCameraTransformToClipboard())),
                    Button.component(this.createButton("Paste Camera Transform", () => this.setCameraTransformFromClipboard()))
                ]),
                m.layout.element({}, [
                    Button.component(this.createButton("Reset Camera Transform", () => this.resetCameraTransform()))
                ])
                ])
            ]);
        }
        
        createButton(text, onclick, disabled = false, classes, title) {
            return {
                onclick: onclick,
                title: title ? title : text,
                text: text,
                class: classes,
                disabled : disabled
            };
        }

        sendCameraTransformToClipboard(){
            let clipboardObj = {
                position: {
                    X: this.model.state.position.X,
                    Y: this.model.state.position.Y,
                    Z: this.model.state.position.Z
                },
                rotation: 
                {
                    X: this.model.state.rotation.X,
                    Y: this.model.state.rotation.Y,
                    Z: this.model.state.rotation.Z,
                    W: this.model.state.rotation.W
                }
            };
            return hostService.setClipboardTextData(JSON.stringify(clipboardObj));
        }

        setCameraTransformFromClipboard(){
            return hostService.getClipboardTextData()
            .then(clipboardObj => {
                try{
                    if(!clipboardObj.position || !clipboardObj.rotation) throw "Invalid Clipboard Object";
                    this.model.pushFullState(clipboardObj).then(() => m.utils.redraw("Camera value updated"));
                }catch(e){
                    console.warn("The clipboard content is not a valid camera transform");
                }
            });
        }

        resetCameraTransform(){
            return this.model.pushFullState(DEFAULT_CAMERA_TRANSFORM)
            .then(() => m.utils.redraw("Camera transform reset"));
        }

        /**
         * Entry point to compose view.
         */
        static view (ctrl) {
            return ctrl.render();
        }

        /**
         * Mount a new playground
         * @param {HtmlElement} container
         * @return {{component, noAngular: boolean}}
         */
        static mount (container) {
            let instance = m.mount(container, {
                controller: this,
                view: this.view
            });
            return { instance, component: this, noAngular: true };
        }

        static run(mountPoint) {
            return this.mount(mountPoint);
        }
    }

    return CameraTransformApp;
});