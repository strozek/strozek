require 'rubygems'
require 'sinatra'
require 'sinatra/base'
require 'wavefile'
include WaveFile
require 'json'
require 'digest/md5'

# use Rack::Deflater
set :port, 80
set :bind, '0.0.0.0'
set :server, %w[thin webrick]
# set :static_cache_control, [:public, :max_age => 2678400]
# set :sessions, true

FRAMERATE = 44100 # Hz; must divide evenly into 100

class App < Sinatra::Base

  @@leadinDuration = 0.5 # seconds
  @@bitDuration = 0.1 # seconds
  @@numSlots = 5
  @@bitLength = 5
  @@loF = 18000 # Hz
  @@hiF = 20000 # Hz
  
  def S(t, data)  # generates the S curve given absolute time t from start of signal
    if(t<@@leadinDuration)
      t2s = t/@@leadinDuration
      return t2s*@@hiF + (1-t2s)*@@loF
    else
      bit = @@bitLength - 1 - ((t-@@leadinDuration)/@@bitDuration).floor
      t3s = ((t-@@leadinDuration) % @@bitDuration) / @@bitDuration
      if( (data & (1<<bit)) != 0)
        return t3s*@@hiF + (1-t3s)*@@loF
      else
        return t3s*@@loF + (1-t3s)*@@hiF
      end
    end
  end

  def writeSilence(duration, writer)
    zeroCycle = [0]*(FRAMERATE/100)
    zeroBuffer = Buffer.new(zeroCycle, Format.new(:mono, :float, FRAMERATE))
    (100*duration).to_i.times do
      writer.write(zeroBuffer)
    end
  end

  def getHash(data)
    return Digest::MD5.hexdigest(
        @@leadinDuration.to_s + "*" + 
        @@bitDuration.to_s + "*" + 
        @@numSlots.to_s + "*" + 
        @@loF.to_s + "*" +
        @@hiF.to_s + "*" +
        @@bitLength.to_s + "*" + 
        data.to_s)[0..7]
  end

  get '/' do
    erb :index, :locals => {:environment => settings.environment.to_s} 
  end
  get '/info' do
    erb :info, :locals => {:environment => settings.environment.to_s,
                           :host => request.host}
  end
  get '/earshot' do
    erb :earshot, :locals => {:environment => settings.environment.to_s} 
  end
  get '/earshot/:leadin/:bit/:slots/:lof/:hif/:bitlength/:data' do
    @@leadinDuration = params[:leadin].to_f
    @@bitDuration = params[:bit].to_f
    @@numSlots = params[:slots].to_i
    @@loF = params[:lof].to_i
    @@hiF = params[:hif].to_i
    @@bitLength = params[:bitlength].to_i
    data = params[:data].to_i
    hash = getHash(data)
    if(!File::exist?("public/wavs/#{hash}.wav"))
      duration = @@leadinDuration + @@bitDuration*@@bitLength
      format = Format.new(:mono, :pcm_16, FRAMERATE)
      writer = Writer.new("public/wavs/#{hash}.wav", format)
      r = rand(@@numSlots)
      if(r>0)
        writeSilence(r*duration, writer)
      end
      cycle = []
      integral = 0
      for i in 0..(FRAMERATE*duration-1)
        # Sin[ 2pi* (@@loF + int_0^t S(t) dt)]
        t = 1.0*i/FRAMERATE
        cycle[i] = Math::sin(2.0*3.14159*(integral))
        integral = integral + S(t, data)*(1.0/FRAMERATE)
      end
      buffer = Buffer.new(cycle, Format.new(:mono, :float, FRAMERATE))
      writer.write(buffer)
      if(r<@@numSlots-1)
        writeSilence((@@numSlots-1-r)*duration, writer)
      end
      writer.close()
    end
    result = {:status => 0, :url => "/wavs/#{hash}.wav"}
    result.to_json
  end
end
