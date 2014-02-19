require 'logger'
require 'sequel'

module MirrorHelpers

class Controller
	@logger = nil
	@db = nil

	def initialize
		pwd = File.dirname(__FILE__)
		@logger = Logger.new("#{pwd}/log/main.log", 10, 1024000)
		@logger.datetime_format = "%Y-%m-%d %H:%M:%S "
	  @logger.level = Logger::DEBUG
		@logger.debug("Controller initialized")
		@db = Sequel.connect("sqlite://#{pwd}/db/mirror.db")
	end

	@@instance = nil
 
  def self.instance
    return @@instance || (@@instance = Controller.new)
  end

	def log
		return @logger
	end

	def db
		return @db
	end

	def close
		@logger.debug("Controller closed.")
		@logger.close
		@db.disconnect
	end
end

def c; Controller.instance; end

end