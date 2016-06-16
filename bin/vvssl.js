#!/usr/bin/env node

var argv   = require('argv');
var assign = require('object-assign');
var fs     = require('fs-promise');
var path   = require('path');
var pkg    = require('../package');
var vvssl  = require('..');
var find   = require('../lib/find-vagrant');

var script = (process.argv[1] || '').split('/').pop();

// define options
argv.option([
	{
		name:  'name',
		short: 'n',
		type:  'string',
		description: 'Name of the site'
	},
	{
		name:  'dir',
		short: 'd',
		type:  'path',
		description: 'Location of the vagrant installation'
	},
	{
		name:  'key',
		short: 'k',
		type:  'path',
		description: 'Location of an existing site key (.key)'
	},
	{
		name:  'crt',
		short: 'c',
		type:  'path',
		description: 'Location of an existing site certificate (.crt)'
	},
	{
		name:  'list',
		short: 'l',
		type:  'bool',
		description: 'Displays a list of available sites'
	},
	{
		name:  'version',
		short: 'v',
		type:  'bool',
		description: 'Displays the current version of ' + script
	},
	{
		name:  'help',
		short: 'h',
		type:  'bool',
		description: 'Displays usage instructions for ' + script
	}
]);

// get arguments
var args = argv.run();

// site name
var name = args.targets[0];

// normalized options
var opts = assign({
	name: name
}, args.options);

// if the site name is defined
if (name) {
	if (args.options.dir) {
		// run vvssl
		vvssl(opts);
	} else {
		// promise the vagrant directory
		find(2000).then(function (vagrantDir) {
			// vagrant directory
			opts.dir = vagrantDir;

			// run vvssl
			vvssl(opts);
		}).catch(function (message) {
			console.log(message);

			process.exit(1);
		});
	}
} else if (opts.list) {
	// promise the vagrant directory
	find(2000).then(function (vagrantDir) {
		// configuration directory
		var confDir = path.join(vagrantDir, 'config', 'nginx-config', 'sites');

		// promise a conf directory file listing
		var confPromise = fs.readdir(confDir);

		var isConfFile = /\.conf$/;

		// log the available sites
		confPromise.then(function (files) {
			var listMsg = [''].concat(files.filter(function (file) {
				return isConfFile.test(file);
			}).map(function (file) {
				return path.basename(file, '.conf');
			})).join('\n');

			console.log(listMsg);
		});
	}).catch(function (message) {
		console.log(message);

		process.exit(1);
	});
} else if (opts.version) {
	var versionMsg = [
		'',
		pkg.version
	].join('\n');

	console.log(versionMsg);
} else {
	var usageMsg = [
		'',
		'Usage: ' + script + ' [options]'
	].concat(Object.keys(argv.options).map(function (key) {
		return argv.options[key];
	}).map(function (option) {
		return '\n\t-' + option.name + ', -' + option.short + '\n\t\t' + option.description;
	})).join('\n');

	console.log(usageMsg);
}
