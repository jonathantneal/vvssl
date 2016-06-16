var err  = require('./errors');
var exec = require('child-process-promise').exec;
var fs   = require('fs-promise');
var path = require('path');

module.exports = function verifyCertificates(opts, domain) {
	// whether this is macOS
	var isMacPlatform = process.platform === 'darwin';

	// site directory
	var siteDir = path.join(opts.dir, 'www', opts.name);

	// site key and certificate files
	var keyFile = path.join(siteDir, 'ssl.key');
	var crtFile = path.join(siteDir, 'ssl.crt');

	// promise copied key or generated key
	var keyFilePromise = opts.key ? fs.copy(opts.key, keyFile) : fs.stat(keyFile).catch(function () {
		// promise generated key
		return exec('openssl genrsa -out ' + keyFile + ' 2048').catch(function () {
			throw err.cantCreateKey;
		});
	});

	// promise certificate
	var crtFilePromise = keyFilePromise.then(function () {
		// promise copied certificate or existing certificate or generated certificate
		return opts.certificate ? fs.copy(opts.certificate, crtFile) : fs.stat(crtFile).catch(function () {
			// promise existing certificate
			return fs.stat(crtFile).catch(function () {
				// promise generated certificate
				return exec('openssl req -new -x509 -key ' + keyFile + ' -out ' + crtFile + ' -days 3650 -subj /CN=' + domain).catch(function () {
					throw err.cantCreateCert;
				});
			});
		});
	});

	// promise the certificate is in the keychain
	var keychainPromise = crtFilePromise.then(function () {
		if (isMacPlatform) {
			// verify the certificate is in the keychain or add it
			return exec('security verify-cert -c ' + crtFile).catch(function () {
				// add the certificate to the keychain
				return exec('security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ' + crtFile).catch(function (error) {
					if (/write permissions error/.test(error.stderr)) {
						console.log('We may need permission to update your keychain.');

						return exec('sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ' + crtFile);
					} else {
						throw err.cantUpdateKeychain;
					}
				});
			}).then(function () {
				return domain;
			}).catch(function () {
				throw err.cantUpdateKeychain;
			});
		} else {
			return domain;
		}
	});

	return keychainPromise;
};
