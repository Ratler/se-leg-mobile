/**
 * Fingerprint factory to work with the plugins.
 * For Android: https://github.com/mjwheatley/cordova-plugin-android-fingerprint-auth
 * For iOS: https://github.com/EddyVerbruggen/cordova-plugin-touch-id
 * @param {type} angular
 * @author Alejandro Gomez <amoron@emergya.com>
 * @since Jan 11 2017
 */

(function () {
  define(['./fingerprint.module'], function (moduleName) {
    'use strict';
    angular
      .module(moduleName)
      .factory('FingerprintFactory', FingerprintFactory);

    /* @ngInject */
    function FingerprintFactory($q, $state, SE_LEG_VIEWS, FingerprintScannerStrategyFactory) {
      var factory = {};
      var ready = false;
      var fingerprintScannerFactory;

      // Public methods
      factory.existsFingerprintDevice = existsFingerprintDevice;
      factory.existsFingerprintRegistered = existsFingerprintRegistered;
      factory.checkFingerPrintRegistered = checkFingerPrintRegistered;
      factory.authenticateFingerprint = authenticateFingerprint;
      factory.isReady = isReady;

      activate();

      function activate() {
        fingerprintScannerFactory = FingerprintScannerStrategyFactory.getFingerprintScannerHandler();
      }

      /**
       * It checks the device has the needed hardware.
       * @returns {$q@call;defer.promise}
       */
      function existsFingerprintDevice() {
        var deferred = $q.defer();

        fingerprintScannerFactory.isAvailable()
          .then(function (result) {
            if (result.isHardwareDetected) {
              ready = true;
              deferred.resolve(result);
            } else {
              deferred.reject(result);
            }
          })
          .catch(deferred.reject);

        return deferred.promise;
      }

      /**
       * It checks the device has registered fingerprint (and the needed hardware).
       * @returns {$q@call;defer.promise}
       */
      function existsFingerprintRegistered() {
        var deferred = $q.defer();

        existsFingerprintDevice()
          .then(function (result) {
            if (!result.isAvailable) {
              deferred.reject(result);
            } else {
              deferred.resolve(result);
            }
          })
          .catch(deferred.reject);

        return deferred.promise;
      }

      /**
       * It checks if there is a fingeprint registered and also shows a conirmation screen (if configured).
       * @param showContinueScreen flag to know if a confirmation screen will be shown or not.
       * @param continueScreenConfig with all the configuration for the nextScreen,
       * @returns {$q@call;defer.promise}
       */
      function checkFingerPrintRegistered(showContinueScreen, continueScreenConfig) {
        var deferred = $q.defer();

        existsFingerprintRegistered()
          .then(function (result) {
            deferred.resolve(result);
            handleFingerprintSuccess(showContinueScreen, continueScreenConfig);
          })
          .catch(function (error) {
            deferred.reject({
              errorFn: function () {
                //    ; /* DO NOTHING */
              }
            });
          });

        return deferred.promise;
      }

      function handleFingerprintSuccess(showContinueScreen, continueScreenConfig) {
        if (showContinueScreen) {
          if (continueScreenConfig === undefined) {
            continueScreenConfig = {
              params: {}
            };
          }

          if (!continueScreenConfig.state) {
            continueScreenConfig.state = SE_LEG_VIEWS.MESSAGE;
          }

          if (!continueScreenConfig.params.title) {
            continueScreenConfig.params.title = 'fingerprintVerification.title';
          }

          if (!continueScreenConfig.params.msg) {
            continueScreenConfig.params.msg = 'fingerprintVerification.message';
          }

          if (!continueScreenConfig.params.onClick) {
            continueScreenConfig.params.onClick = function () {
              $state.go(SE_LEG_VIEWS.SCANNER);
            };
          }

          if (!continueScreenConfig.params.textButton) {
            continueScreenConfig.params.textButton = 'fingerprintVerification.continue';
          }
          // go to the message
          $state.go(continueScreenConfig.state, {
            data: {
              title: continueScreenConfig.params.title,
              msg: continueScreenConfig.params.message,
              buttonOptions: [
                {
                  condition: true,
                  text: continueScreenConfig.params.textButton,
                  onClick: function () {
                    continueScreenConfig.params.onClick();
                  },
                  default: true
                }
              ]
            }
          });
        }
      }

      /**
       * It authenticates the user getting his fingerprint.
       * @returns {$q@call;defer.promise}
       */
      function authenticateFingerprint() {
        return fingerprintScannerFactory.verifyFingerprint();
      }

      /**
       * It checks if the factory is ready to be used.
       * @returns {Boolean} true if the factory is ready to be used.
       */
      function isReady() {
        return ready;
      }

      return factory;
    }
  });
})();
