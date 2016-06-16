var exec = require('child-process-promise').exec;
var err  = require('./errors');

module.exports = function restartNginx(opts, domain) {
	// promise nginx has copied the new configuration and has restarted
	var nginxPromise = exec('vagrant ssh -c "sudo cp /srv/config/nginx-config/sites/' + opts.name + '.conf /etc/nginx/custom-sites/ && sudo service nginx restart"', {
		cwd: opts.dir
	}).then(function () {
		return domain;
	}).catch(function () {
		throw err.cantRestartNginx;
	});

	return nginxPromise;
};
