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

	@host = /lukasz.work/
	get '/', :host_name => @host do
		erb :index
	end

	@host = /strozek.com/
  	get '/', :host_name => @host do
    	erb :index
  	end

  	get '/' do
    	erb :index
  	end

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
		response['Access-Control-Allow-Origin'] = 'https://elevenseconds.com/'
		response['X-Frame-Options'] = ''
		erb :zoom
	end

	get '/disappear/bw/:text' do
		response['Access-Control-Allow-Origin'] = 'https://elevenseconds.com/'
		response['X-Frame-Options'] = ''
		erb :disappear_bw, :locals => {:message => params[:text].gsub(/"/, '\\"')}
	end

	get '/disappear/color/:text/:distraction' do
		response['Access-Control-Allow-Origin'] = 'https://elevenseconds.com/'
		response['X-Frame-Options'] = ''
		erb :disappear_color, :locals => {:message => params[:text].gsub(/"/, '\\"'), :distraction => params[:distraction].gsub(/"/, '\\"')}
	end

	get '/pictionary/:word_group' do
		@word_group = params[:word_group]
		erb :pictionary
	end

	get '/wordgame/:player' do
		@player = params[:player]
		erb :wordgame
	end

	get '/wordgame/commands/list' do
		payload = File.read("./data/wordgame.txt")
		return payload
	end

	post '/wordgame/commands' do
		File.write("./data/wordgame.txt", params.to_json)
		return {success: true}.to_json
	end

	get '/loveandmath' do
		erb :loveandmath
	end

  get '/panda' do
    erb :panda
  end

  get '/mazeandgirl' do
    erb :mazeandgirl
  end

  get '/logo' do
    erb :logo
  end

  get '/money' do
    erb :money
  end

  get '/landrun' do
    erb :landrun
  end

	run! if (app_file == $0)
end
