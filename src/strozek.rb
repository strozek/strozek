require './config/secrets/SESSION_SECRET.rb'

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

require 'sinatra/base'
require 'RMagick'
require 'sequel'
require './src/disappearing.rb'
require './src/crowdsource.rb'

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
		content_type 'image/png'
		image = Disappearing::GenerateBWDisappearingImage(params[:text])
		image.to_blob()
	end
	get '/disappear/color/:text/:distraction' do
		content_type 'image/png'
		image = Disappearing::GenerateColorDisappearingImage(params[:text], params[:distraction])
		image.to_blob()
	end

	#@host = /loveandmathematics.us/
	get '/loveandmath' do
		erb :loveandmath
	end

	run! if (app_file == $0)
end
