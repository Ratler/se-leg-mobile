/**
 * Main factory to handle all the main app staff.
 * @param {type} angular
 * @author Alejandro Gomez <amoron@emergya.com>
 * @since Jan 11 2017
 */
(function () {
  define(['./main.module'], function (moduleName) {
    'use strict';
    angular
      .module(moduleName)
      .factory('MainFactory', MainFactory);
    /* @ngInject */
    function MainFactory($state, $q, UtilsFactory, SE_LEG_VIEWS, FingerPrintFactory, ScannerFactory, MessageFactory,
      DataFactory, ModalFactory) {
      var factory = this;
      // internal variables
      var appWorkflow = [];
      var usedModules = {};
      var currentComponent = -1;
      initializeWorkflow();
      factory.handleNextComponent = handleNextComponent;
      factory.handlePreviousComponent = handlePreviousComponent;
      ////////////////////
      // Public methods //
      ////////////////////

      /**
       * It inializes the app configured workflow.
       */
      function initializeWorkflow() {
        loadWorkflow();
        // once the workflow is loaded, we have to initialize it
        for (var index in appWorkflow) {
          appWorkflow[index].processed = false;
          if (typeof appWorkflow[index].backAllowed === 'undefined') {
            // by default the back is allowed
            appWorkflow[index].backAllowed = true;
          }
          // getting the module name we are using
          if (!usedModules[appWorkflow[index].url]) {
            usedModules[appWorkflow[index].url] = appWorkflow[index].factory;
          }
        }
      }

      /* @@workflow-placeholder */

      /**
       * It gets the previous component and sends the user into it.
       * If I am in the first component, the App will be closed.
       */
      function handlePreviousComponent() {
        var component = getPreviousComponent();
        if (component !== undefined) {
          if (!component.backAllowed) {
            UtilsFactory.closeApp({title: 'MAIN ERROR', text: 'BACK NOT ALLOWED'});
          } else {
            if (component.preconditions) {
              component.preconditions()
                .then(function () {
                  currentComponent--;
                  goToComponent(component);
                })
                .catch(function (error) {
                  if (component.onErrorFn) {
                    component.onErrorFn(error);
                  } else {
                    UtilsFactory.closeApp({title: 'MAIN ERROR', text: 'CUSTOMIZED MAIN ERROR'});
                  }
                });
            } else {
              currentComponent--;
              goToComponent(component);
            }
          }
        } else {
          UtilsFactory.closeApp();
        }
      }

      /**
       * It gets the next component and sends the user into it.
       * If there is no next component, TODO: what happens?
       */
      function handleNextComponent() {
        var component = getNextComponent();
        if (component !== undefined) {
          if (component.preconditions) {
            component.preconditions()
              .then(function () {
                currentComponent++;
                goToComponent(component);
              })
              .catch(function (error) {
                if (component.onErrorFn) {
                  component.onErrorFn(error);
                } else {
                  UtilsFactory.closeApp({title: 'MAIN ERROR', text: 'CUSTOMIZED MAIN ERROR'});
                }
              });
          } else {
            currentComponent++;
            goToComponent(component);
          }
        } else {
          // TODO: SHOULD BE TRANSLATED
          UtilsFactory.closeApp({title: 'MAIN ERROR', text: 'CUSTOMIZED MAIN ERROR'});
        }
      }


      //////////////////////
      // Private methods //
      //////////////////////

      /**
       * It retrieves the next component (if there is a new component).
       * @returns JSON with a component information or undefined.
       */
      function getNextComponent() {
        var component = undefined;
        if (currentComponent < appWorkflow.length - 1) {
          component = appWorkflow[currentComponent + 1];
        }
        return component;
      }

      /**
       * It retrieves the next component (if there is a new component).
       * @returns JSON with a component information or undefined.
       */
      function getPreviousComponent() {
        var component = undefined;
        if (currentComponent - 1 >= 0) {
          component = appWorkflow[currentComponent - 1];
        }
        return component;
      }

      /**
       * It goes to the component with the position required.
       * It avoids the PRECONDITIONS.
       * @param position to get the component.
       */
      function goToPosition(position) {
        if (position >= 0 && position <= appWorkflow.length) {
          currentComponent = position - 1;
          handleNextComponent();
        }
      }

      /**
       * It goes to the provides component.
       * @param component where we want to navigate.
       */
      function goToComponent(component) {
        if (component !== undefined && component.state) {
          if (component.params) {
            $state.go(component.state, {data: component.params});
          } else {
            $state.go(component.state, {data: {}});
          }
        }
      }

      return factory;
    }
  });
})();
