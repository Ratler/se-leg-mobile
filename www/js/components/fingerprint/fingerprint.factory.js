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
      .factory('FingerPrintFactory', FingerPrintFactory);
    /* @ngInject */
    function FingerPrintFactory($q, $state, SE_LEG_GLOBAL, SE_LEG_VIEWS, UtilsFactory, ModalFactory) {
      var factory = this;
      var ready = false;
      var isFingerprintValid = false;

      // Public methods
      factory.existsFingerprintDevice = existsFingerprintDevice;
      factory.existsFingerprintRegistered = existsFingerprintRegistered;
      factory.checkFingerPrintRegistered = checkFingerPrintRegistered;
      factory.authenticateFingerprint = authenticateFingerprint;
      factory.isReady = isReady;

      return factory;
      /**
       * It checks the device has the needed hardware.
       * @returns {$q@call;defer.promise}
       */
      function existsFingerprintDevice() {
        var deferred = $q.defer();
        if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.ANDROID) {
          if (FingerprintAuth) {
            FingerprintAuth.isAvailable(function (result) {
              if (result.isHardwareDetected) {
                ready = true;
                deferred.resolve(result);
              } else {
                deferred.reject();
              }
            }, function (error) {
              deferred.reject();
            });
          } else {
            deferred.reject();
          }
        } else if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.IOS) {
          if (window.plugins && window.plugins.touchid) {
            window.plugins.touchid.isAvailable(
              function (result) {
                deferred.resolve(result);
              }, // success handler: TouchID available
              function (msg) {
                deferred.reject();
              } // error handler: no TouchID available
            );
          } else {
            deferred.reject();
          }
        } else {
          deferred.reject();
        }
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
            if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.ANDROID) {
              if (!result.isAvailable) {
                deferred.reject(result);
              } else {
                deferred.resolve(result);
              }
            } else if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.IOS) {
              ; // TODO: IOS
            } else {
              deferred.reject();
            }
          })
          .catch(deferred.reject);
        return deferred.promise;
      }

      /**
       * It checks if there is a fingeprint registered and also shows a conirmation screen (if configured).
       * @param showContinueScreen flag to know if a confirmation screen will be shown or not.
       * @returns {$q@call;defer.promise}
       */
      function checkFingerPrintRegistered(showContinueScreen) {
        var deferred = $q.defer();
        existsFingerprintRegistered()
          .then(function (result) {
            deferred.resolve(result);
          })
          .catch(function (error) {
            ModalFactory.showModal(
              {
                title: 'error.fingerprint.notFIngerprintRegisteredTitle',
                text: 'error.fingerprint.notFIngerprintRegisteredTitle',
                id: SE_LEG_VIEWS.FINGERPRINTVERIFICATION,
                onHideFn: function () {
                  if (cordova.plugins && cordova.plugins.settings && typeof cordova.plugins.settings.openSetting
                    != undefined) {
                    cordova.plugins.settings.openSetting("security", function () {},
                      function () {
                        $state.go(SE_LEG_VIEWS.MESSAGE,
                          {
                            errorScreen: true,
                            title: 'SECURITY TITLE',
                            msg: 'security.error.errorOpenSecurity',
                            buttonOptions: [
                              {
                                text: 'message.close',
                                onClick: function () {
                                  UtilsFactory.closeApp();
                                }
                              }]
                          });
                      });
                  }
                  if (showContinueScreen) {
                    $state.go(SE_LEG_VIEWS.FINGERPRINTVERIFICATION);
                  }
                }
              });
            deferred.reject({errorFn: function () {
                ; /* DO NOTHING */
              }
            });
          });
        return deferred.promise;
      }

      /**
       * It authenticates the user getting his fingerprint.
       * @returns {$q@call;defer.promise}
       */
      function authenticateFingerprint() {
        var deferred = $q.defer();

        if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.ANDROID) {
          // it is available
          var client_id = "Your client ID";
          var client_secret = "A very secret client secret (once per device)";

          FingerprintAuth.show({
            clientId: client_id,
            clientSecret: client_secret,
            disableBackup: true
          }, function (result) {
            isFingerprintValid = true;
            deferred.resolve(result);
          }, function (error) {
            deferred.reject(error);
          });
        } else if (UtilsFactory.getPlatform() === SE_LEG_GLOBAL.PLATFORMS.IOS) {
          ; // TODO: IOS
        } else {
          deferred.reject();
        }

        return deferred.promise;
      }

      /**
       * It checks if the factory is ready to be used.
       * @returns {Boolean} true if the factory is ready to be used.
       */
      function isReady() {
        return ready;
      }

      /**
       * It returns if the fingerprint is valid.
       * @returns true if the user authenticates with his fingerprint.
       */
      function isFingerPrintValid() {
        return isFingerPrintValid;
      }

    }
  });
})();
