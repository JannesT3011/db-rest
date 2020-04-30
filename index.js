'use strict'

const {readFileSync} = require('fs')
const {join} = require('path')
const createHafas = require('db-hafas')
const createApi = require('hafas-rest-api')
const createHealthCheck = require('hafas-client-health-check')

const pkg = require('./package.json')
const stations = require('./routes/stations')
const station = require('./routes/station')

const docsAsMarkdown = readFileSync(join(__dirname, 'docs', 'index.md'), {encoding: 'utf8'})

const hafas = createHafas(pkg.name)

const berlinHbf = '8011160'
const healthCheck = createHealthCheck(hafas, berlinHbf)

const modifyRoutes = (routes) => {
	routes['/stations'] = stations
	routes['/stations/:id'] = station
	return routes
}

const config = {
	hostname: process.env.HOSTNAME || 'localhost',
	port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
	name: pkg.name,
	description: pkg.description,
	homepage: pkg.homepage,
	version: pkg.version,
	docsAsMarkdown,
	docsLink: '/docs',
	logging: true,
	aboutPage: true,
	etags: 'strong',
	healthCheck,
	modifyRoutes,
}

const api = createApi(hafas, config, () => {})

api.listen(config.port, (err) => {
	const {logger} = api.locals
	if (err) {
		logger.error(err)
		process.exit(1)
	} else {
		logger.info(`Listening on ${config.hostname}:${config.port}.`)
	}
})
