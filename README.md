# vvssl

<a href="https://github.com/jonathantneal/vvssl"><img src="https://jonathantneal.github.io/vvssl/logo.svg" alt="vvssl logo" width="80" height="80" align="right"></a>

[![NPM Version][npm-img]][npm] [![Build Status][ci-img]][ci]

[vvssl] is a command line utility that helps you quickly setup [https] for any
Vagrant site. It automatically finds your vagrant directory, creates the needed
local domain certificates, authenticates them with your system, and updates
your Nginx configuration.

```sh
vvssl sitename
# SSL enabled for https://sitename.local
```

### Installation

```sh
npm install -g jonathantneal/vvssl
```

### Usage

```sh
vvssl
# Usage: vvssl [options]
#
#    --name, -n
#        Name of the site
#
#    --dir, -d
#        Location of the vagrant installation
#
#    --key, -k
#        Location of an existing site key (.key)
#
#    --crt, -c
#        Location of an existing site certificate (.crt)
#
#    --list, -l
#        Displays a list of available sites
#
#    --version, -v
#        Displays the current version of vvssl
#
#    --help, -h
#        Displays usage help for vvssl
```

### Options

##### `--name`

Name of the site you are targetting  
`vvssl sitename` or `vvssl -n sitename` or `vvssl --name sitename`

##### `--dir`

Location of the vagrant installation
`vvssl sitename -d /path/to/vagrant-local` or `vvssl sitename --directory /path/to/vagrant-local`

##### `--key`

Location of an existing site key to copy over (.key)  
`vvssl sitename -k /path/to/sitename.key` or `vvssl sitename --key /path/to/sitename.key`

##### `--crt`

Location of an existing site certificate (.crt)  
`vvssl sitename -c /path/to/sitename.crt` or `vvssl sitename --crt /path/to/sitename.crt`

##### `--list`

Displays a list available sites
`vvssl -l` or `vvssl --list`

##### `--version`

Displays the current version of vvssl  
`vvssl -v` or `vvssl --version`

##### `--help`

Displays usage instructions for vvssl  
`vvssl -h` or `vvssl --help`

[ci]:      https://travis-ci.org/jonathantneal/vvssl
[ci-img]:  https://img.shields.io/travis/jonathantneal/vvssl.svg
[npm]:     https://www.npmjs.com/package/vvssl
[npm-img]: https://img.shields.io/npm/v/vvssl.svg

[https]: https://en.wikipedia.org/wiki/HTTPS
[vvssl]: https://github.com/jonathantneal/vvssl
