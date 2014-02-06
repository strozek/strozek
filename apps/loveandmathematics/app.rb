require 'sinatra'
require 'sinatra/base'

set :port, 80
set :bind, '0.0.0.0'
set :server, %w[thin webrick]

class LoveAndMathematics < Sinatra::Base
  get '/' do
    erb :index
  end
end
