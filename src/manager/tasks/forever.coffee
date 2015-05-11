# --------------------------------------------------
#	Forever ~ Syncs connected browsers with latest files
# --------------------------------------------------
fs		= require 'fs'
log		= require 'de-logger'
forever	= require 'forever-monitor'


class Forever

	constructor: (@server) ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		@path = "#{@server.options.root}/#{@server.options.build}/#{@server.options.server}/#{@server.options.forever.file}"

		@create()


	create: ->

		@child = new (forever.Monitor) @path,
			max:			1
			watch:			false
			killTree:		true

		@child.on 'exit:code', (code) =>

			return if code is null

			log.warn 'LDE - Forever', "Exit code: #{code}. #{@server.options.build}/#{@server.options.server}/#{@server.options.forever.file}"


	start: ->

		# Don't run forever if it's not required
		return unless @server.options.forever.enabled

		# Check if file exists before running the bundle
		fs.exists @path, (bool) =>

			# Don't build bundle due to lack of entry file
			return log.warn 'LDE - Forever', 'Entry file doesn\'t exist', @path.replace "#{@server.options.root}/", '' unless bool

			# Restart if process was once started already and is running
			return @child.restart() if @child.running

			# Start server
			@child.start()



module.exports = Forever