require 'sinatra'
require 'sinatra/base'
require 'RMagick'
require 'sequel'
require 'digest/sha1'
require 'timeout'
require 'pp'
pwd = File.dirname(__FILE__)
require "#{pwd}/disappearing"
require "#{pwd}/crowdsource"

class Strozek < Sinatra::Base

  pwd = File.dirname(__FILE__)
  require "#{pwd}/salt-NO-GIT.rb"
  include Magick
  include StrozekHelpers

	get '/info' do
		erb :info, :locals => {:environment => settings.environment.to_s,
													 :host => request.host}
	end

	@host = /elevenseconds\.\w+$/
	get '/', :host_name => @host do
		erb :errorpage, :locals => {:title => "elevenseconds: on exploration, introspection and creation",
																:name => "elevenseconds",
																:header => "<span class='glyphicon glyphicon-time'></span> Under maintenance",
																:body => "<em>Elevenseconds</em> is under maintenance. Please come back soon."}
	end

	@host = /^\d+\.\d+\.\d+\.\d+$/
	get '/', :host_name => @host do
		erb :errorpage, :locals => {:title => "strozek.com",
																:name => "strozek.com",
																:header => "Nothing here",
																:body => "There is nothing here. Did you mean to visit <a href='http://strozek.com'>strozek.com</a>?"}
	end
	
	@host = /^flashcards\.strozek\.\w+$/
	get '/', :host_name => @host do
		erb :flashcards
	end
	
	@host = /^memorize\.strozek\.\w+$/
	get '/', :host_name => @host do
		erb :memorize
	end

	@host = /^truthtable\.strozek\.\w+$/
	get '/', :host_name => @host do
		erb :truthtable
	end

	@host = /^graphics\.strozek\.\w+$/
	get '/disappear/bw/:text', :host_name => @host do
		content_type 'image/png'
		image = Disappearing::GenerateBWDisappearingImage(params[:text])
		image.to_blob()
	end
	get '/disappear/color/:text/:distraction', :host_name => @host do
		content_type 'image/png'
		image = Disappearing::GenerateColorDisappearingImage(params[:text], params[:distraction])
		image.to_blob()
	end
	get '/zoom', :host_name => @host do
		erb :zoom
	end
	get '/dice', :host_name => @host do
		erb :dice
	end
	get '/fire', :host_name => @host do
		erb :fire
	end
	get '/luck', :host_name => @host do
		erb :luck
	end
	get '/crowdsource', :host_name => @host do
		erb :crowdsource
	end
	get '/crowdsource/image/:data', :host_name => @host do
		content_type 'image/png'
		i = Crowdsource.new
		image = i.image
		i.close
		image.to_blob()
	end
	get '/crowdsource/makeMeAToken/:salt/:amount', :host_name => @host do
		i = Crowdsource.new
		i.lock do
			if(params[:salt] == SALT)
				token = i.makeToken(((params[:amount].to_i)**0.8).round)
				i.log('makeMeAToken: ' + params[:amount] + ' => ' + token)
			else
				token = ''
				i.log('makeMeAToken: invalid salt')
			end
			i.close
			break token
		end
	end
	get '/crowdsource/listMeTheTokens/:salt', :host_name => @host do
		i = Crowdsource.new
		if(params[:salt] == SALT)
			allTokens = i.showAllTokens
		else
			allTokens = ''
		end
		i.close
		allTokens
	end
	get '/crowdsource/inspect/?:token?', :host_name => @host do
		i = Crowdsource.new
		info = i.tokenInfo(params[:token])
		i.close
		if(info == nil)
			result = {:success => false}
		else
			result = {:success => true, :pixels => info[2]}
		end
		result.to_json
	end
	get '/crowdsource/split/:token/:amount', :host_name => @host do
		i = Crowdsource.new
		result = {:success => false}
		i.lock do
			info = i.tokenInfo(params[:token])
			if(info != nil)
				a = (params[:amount].to_i**0.8).round
				b = info[0]-a
				if(a>=1 && b>=1)
					i.invalidateToken(params[:token])
					result = {:success => true, :tokenA => i.makeToken(a), :tokenB => i.makeToken(b)}
					i.log('split: ' + params[:token] + ' => ' + result.to_json)
				end
			end
			i.close
		end
		result.to_json
	end
	get '/crowdsource/merge/:token1/:token2', :host_name => @host do
		i = Crowdsource.new
		result = {:success => false}
		i.lock do
			info1 = i.tokenInfo(params[:token1])
			if(info1 != nil)
				info2 = i.tokenInfo(params[:token2])
				if(info2 != nil && params[:token1]!=params[:token2])
					i.invalidateToken(params[:token1])
					i.invalidateToken(params[:token2])
					result = {:success => true, :token => i.makeToken(info1[0]+info2[0])}
					i.log('merge: ' + params[:token1] + ':' + params[:token2] + '=>' + result.to_json)
				end
			end
			i.close
		end
		result.to_json
	end
	get '/crowdsource/overlap/?:art?', :host_name => @host do
		i = Crowdsource.new
		result = {:success => true, :count => i.getOverlapCount(params[:art])}
		i.close
		result.to_json
	end
	get '/crowdsource/submit/:token/:art', :host_name => @host do
		i = Crowdsource.new
		result = {:success => false}
		i.lock do
			info = i.tokenInfo(params[:token])
			art = params[:art]
			overlap = i.getOverlapCount(art)
			if(info != nil && art && overlap+art.split(',').length <= info[2])
				i.submitContribution(art, params[:token])
				i.invalidateToken(params[:token])
				i.log('submit: ' + params[:token] + ' => ' + art)
				i.cacheImage
				result = {:success => true}
			end
			i.close
		end
		result.to_json
	end
	get '/crowdsource/requestMineChallenge', :host_name => @host do
		i = Crowdsource.new
		challenge = i.requestMineChallenge
		i.close
		challenge.to_json
	end
	get '/crowdsource/solveMineChallenge/:mineId/:seed', :host_name => @host do
		i = Crowdsource.new
		result = i.solveMineChallenge(params[:mineId].to_i, params[:seed].to_i)
		i.log('solveMineChallenge: ' + result.to_json)
		i.close
		result.to_json
	end
	
	get '/' do
		redirect 'http://elevenseconds.com'
	end
end
