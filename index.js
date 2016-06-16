var ensureConfig = require('./lib/ensure-config');
var ensureSSL    = require('./lib/ensure-ssl');
var restartNginx = require('./lib/restart-nginx');

require('colors');

// vvssl
module.exports = function vvssl(opts) {
	// promise nginx config
	var configPromise = ensureConfig(opts);

	// promise the certificate
	var sslPromise = configPromise.then(function (domain) {
		return ensureSSL(opts, domain);
	});

	// promise nginx restarts
	var restartPromise = sslPromise.then(function (domain) {
		return restartNginx(opts, domain);
	});

	// return the results and end the process
	restartPromise.then(function (domain) {
		console.log('\nSSL enabled for ' + ('https://' + domain).green);

		process.exit(0);
	}).catch(function (error) {
		console.log('\n' + error.replace('{name}', opts.name.yellow));

		process.exit(1);
	});
};
