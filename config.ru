require 'sinatra'
require 'sinatra/base'
$LOAD_PATH << './lib'
require 'rack-stack'

require './apps/strozek/app'
require './apps/kaavio/app'
require './apps/loveandmathematics/app'
require './apps/earshot/app'

# External
if(File.exists?('../trackr/web/app.rb'))
  require '../trackr/web/app'
end

rack_stack = RackStack.app do
  run Kaavio.new, :when => {:host => /kaavio\.strozek\.\w+$/}
  run Strozek.new, :when => {:host => /strozek\.\w+$/}
  run Strozek.new, :when => {:host => /elevenseconds\.\w+$/}
  run Strozek.new, :when => {:host => /^\d+\.\d+\.\d+\.\d+$/}
  run LoveAndMathematics.new, :when => {:host => /loveandmathematics\.\w+$/}
  run Earshot.new, :when => {:host => /earshot\.strozek\.\w+$/}

  # External
  if(defined?(Trackr))
    run Trackr.new, :when => {:host => /trackr\.\w+$/}
  end
end

run rack_stack
