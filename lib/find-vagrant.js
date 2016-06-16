var err  = require('./errors');
var find = require('findit');
var path = require('path');

module.exports = function findVagrant(limitMs) {
	// home directory
	var homeDir = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];

	// promise to find file or timeout
	var finderPromise = new Promise(function (resolve, reject) {
		// look for the nearest vagrant installation
		var finder = find(homeDir);

		// prevent finder from taking too much time
		var timeout = setTimeout(function () {
			if (!finder._stopped) {
				finder.stop();

				reject(err.cantFindVagrant);
			}
		}, limitMs);

		finder.on('file', function (file) {
			// look for the nearest vagrant installation
			if (/Vagrantfile$/.test(file)) {
				clearTimeout(timeout);

				finder.stop();

				var vagrantDir = path.dirname(file);

				resolve(vagrantDir);
			}
		});
	});

	return finderPromise;
};
