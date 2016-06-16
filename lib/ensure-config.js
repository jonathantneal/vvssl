var conf = require('nginx-conf');
var err  = require('./errors');
var fs   = require('fs-promise');
var path = require('path');

module.exports = function verifyNginxConfig(opts) {
	// configuration file
	var confFile = path.join(opts.dir, 'config', 'nginx-config', 'sites', opts.name + '.conf');

	// promise the site configuration is read
	var siteConfigReadPromise = fs.readFile(confFile, {
		encoding: 'utf8'
	}).catch(function (error) {
		var doesNotExistCode = 'ENOENT';

		if (error.code === doesNotExistCode) {
			throw err.cantFindConfig;
		} else {
			throw err.cantReadConfig;
		}
	});

	// promise the site configuration is parsed
	var siteConfigParsedPromise = siteConfigReadPromise.then(function (contents) {
		// parse the nginx configuration
		var nginxParsedPromise = new Promise(function (resolve) {
			conf.parse(contents, function (error, tree) {
				if (error) {
					throw err.cantParseConfig;
				} else {
					resolve(new conf.NginxConfFile(tree));
				}
			});
		});

		return nginxParsedPromise.catch(function () {
			throw err.cantParseConfig;
		});
	});

	// promise the site configuration is updated
	var siteConfigUpdatedPromise = siteConfigParsedPromise.then(function (root) {
		// verify nginx server
		if (!root.nginx || !root.nginx.server) {
			throw err.cantFindServer;
		}

		// nginx server
		var server = root.nginx.server;

		if (!server.root) {
			throw err.cantFindDir;
		}

		// nginx directory
		var nginxDir = path.dirname(root.nginx.server.root._value);

		if (!server.server_name) {
			throw err.cantFindDomain;
		}

		// nginx name
		var domain = server.server_name._value.split(' ')[0];

		// certificate files
		var crtFile = path.join(nginxDir, 'ssl.crt');
		var keyFile = path.join(nginxDir, 'ssl.key');

		// whether the config should be updated
		var configRequiresUpdate = false;

		// set ssl
		if (!server.ssl) {
			server._add('ssl', 'on');

			configRequiresUpdate = true;
		} else if (!server.ssl._value === 'on') {
			server.ssl._value = 'on';

			configRequiresUpdate = true;
		}

		// activate ssl certificate
		if (!server.ssl_certificate) {
			server._add('ssl_certificate', crtFile);

			configRequiresUpdate = true;
		} else if (server.ssl_certificate._value !== crtFile) {
			server.ssl_certificate._value = crtFile;

			configRequiresUpdate = true;
		}

		// activate ssl certificate key
		if (!server.ssl_certificate_key) {
			server._add('ssl_certificate_key', keyFile);

			configRequiresUpdate = true;
		} else if (server.ssl_certificate_key._value !== keyFile) {
			server.ssl_certificate_key._value = keyFile;

			configRequiresUpdate = true;
		}

		if (configRequiresUpdate) {
			return fs.writeFile(confFile, root).then(function () {
				return domain;
			}).catch(function () {
				throw err.cantWriteConfig;
			});
		} else {
			return domain;
		}
	});

	return siteConfigUpdatedPromise;
};
