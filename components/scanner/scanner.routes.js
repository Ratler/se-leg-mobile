/**
 * Scanner routes.
 * @param {type} angular
 * @author Maria Villalba <mavillalba@emergya.com>
 * @author Alejandro Gomez <amoron@emergya.com>
 * @since Mon Nov 14 2016
 */

(function () {
  define(['./scanner.module', 'text!./scanner.html'], function (module, scannerTemplate) {
    'use strict';
    angular
      .module(module)
      .config(config);

    /* @ngInject */
    function config($stateProvider, SE_LEG_VIEWS) {

      $stateProvider.state(SE_LEG_VIEWS.SCANNER, {
        url: '/' + SE_LEG_VIEWS.SCANNER,
        // needed to by-pass data to the controller through the $stateProvider
        params: {
          data: {},
          handled: false
        },
        template: scannerTemplate,
        controller: 'ScannerController',
        controllerAs: 'scannerCtrl'
      }
      );
    }
  });
})();