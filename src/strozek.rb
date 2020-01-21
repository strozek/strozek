require './config/secrets/SESSION_SECRET.rb'	# secret

require 'sinatra/base'
RMAGICK_BYPASS_VERSION_TEST = true 	# this should not be required, but on production I can't get rid of a version mismatch
require 'RMagick'
require 'sequel'
require './src/crowdsource.rb'

Rack::Mime::MIME_TYPES.merge!({
  ".ogg"     => "application/ogg",
  ".ogx"     => "application/ogg",
  ".webm"    => "video/webm",
  ".ogv"     => "video/ogg",
  ".oga"     => "audio/ogg",
  ".mp4"     => "video/mp4",
  ".m4v"     => "video/mp4",
  ".mp3"     => "audio/mpeg",
  ".m4a"     => "audio/mpeg"
})

class Strozek < Sinatra::Base

	include StrozekHelpers
	include Magick

	use Rack::Session::Cookie, :key => 'rack.session',
		:expire_after => 25920000,
		:secret => SESSION_SECRET
 	set :public_folder, './public'
 	set :views, './views'

	get '/status' do
		"OK"
	end

	get '/info' do
		erb :info, :locals => {:environment => settings.environment.to_s, :host => request.host}
	end

	get '/dice' do
		erb :dice
	end

	get '/fire' do
		erb :fire
	end

	get '/luck' do
		erb :luck
	end

	get '/truthtable' do
		erb :truthtable
	end

	get '/zoom' do
		erb :zoom
	end

	get '/disappear/bw/:text' do
		erb :disappear_bw, :locals => {:message => params[:text].gsub(/"/, '\\"')}
	end

	get '/disappear/color/:text/:distraction' do
		erb :disappear_color, :locals => {:message => params[:text].gsub(/"/, '\\"'), :distraction => params[:distraction].gsub(/"/, '\\"')}
	end

	get '/loveandmath' do
		erb :loveandmath
	end

	@host = /loveandmathematics.us/
	get '/', :host_name => @host do
		erb :loveandmath
	end

	run! if (app_file == $0)
end
