require 'sinatra'
require 'sinatra/base'
#$LOAD_PATH << './lib'
#require 'rack-stack'

# Internal applications
require './apps/mirror/app'
#require './apps/earshot/app'
#require './apps/strozek/app'
#require './apps/loveandmathematics/app'

# External applications
#if(File.exists?('../trackr/web/app.rb'))
#  require '../trackr/web/app'
#end

#rack_stack = RackStack.app do
#  run Mirror.new, :when => {:host => /mirror\.tinyte\.\w+$/}
#  run Earshot.new, :when => {:host => /earshot\.strozek\.\w+$/}
#  run Strozek.new, :when => {:host => /strozek\.\w+$/}
#  run Strozek.new, :when => {:host => /elevenseconds\.\w+$/}
#  run Strozek.new, :when => {:host => /^\d+\.\d+\.\d+\.\d+$/}
#  run LoveAndMathematics.new, :when => {:host => /loveandmathematics\.\w+$/}

  # External
#  if(defined?(Trackr))
#    run Trackr.new, :when => {:host => /trackr\.\w+$/}
#  end
#end

#run rack_stack
run Mirror.new
