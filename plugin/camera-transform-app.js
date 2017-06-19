define((require) => {
    'use strict';

    const stingray = require('stingray');
    const m = require('components/mithril-ext');
    const propertyTransform = require('properties/property-transform');

    const PropertyEditor = require('properties/property-editor-component');
    const PropertyDocument = require('properties/property-document');
    const props = require('properties/property-editor-utils');

    const Spinner = require('components/spinner');

    const CameraTransformModel = require('./camera-transform-model');
    
    class CameraTransformApp {
        constructor(){
            this.model = new CameraTransformModel();
        }
        
        /**
         * Render the viewer with the camera transform.
         */
        render () {
            // return PropertyEditor.component({document:            
            //  new PropertyDocument([
            //     props.category("Camera Transform", {isTransformLayout: true}, [
            //         props.vector3("Position", m.prop([1,2,3]), {increment: 0.5}),
            //         props.rotation("Rotation", m.prop([1,2,3]), {increment: 0.5})
            //     ])
            // ])});

            return PropertyEditor.component({document: 
            new PropertyDocument([
                props.category("Camera Transform", {isTransformLayout: true}, [
                    props.vector3("Position", [this.model.propertyModel('state.position.X'), this.model.propertyModel('state.position.Y'), this.model.propertyModel('state.position.Z')], {decimal: 5, increment: 0.5}),
                    props.rotation("Rotation", [this.model.propertyModel('state.rotation.X'), this.model.propertyModel('state.rotation.Y'), this.model.propertyModel('state.rotation.Z')], {decimal: 5,increment: 0.5})
                ])
            ])});

            // return PropertyEditor.component({document:
            //  new PropertyDocument([
            //     props.category("Light baking options", {flex: 'flex-50-50'}, [
            //         props.number("Position X", this.model.propertyModel('state.position.X'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //         props.number("Position Y", this.model.propertyModel('state.position.Y'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //         props.number("Position Z", this.model.propertyModel('state.position.Z'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //         props.number("Rotation X", this.model.propertyModel('state.rotation.X'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //         props.number("Rotation Y", this.model.propertyModel('state.rotation.Y'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //         props.number("Rotation Z", this.model.propertyModel('state.rotation.Z'), {min: 0, max: 100, decimal: 5, increment: 1.0}),
            //     ])
            // ])});
        }

        // getSpinerFor(modelProp){
        //     return Spinner.component({
        //         model: this.model.propertyModel(modelProp),
        //         disabled: false,
        //         increment: 0.1,
        //         decimal: 4,
        //         placeholder: ""
        //     })
        // }

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