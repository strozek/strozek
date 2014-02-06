require 'sinatra'
require 'sinatra/base'
$LOAD_PATH << './lib'
require 'rack-stack'

require './apps/strozek/app'
require './apps/kaavio/app'
require './apps/loveandmathematics/app'
require './apps/workshop11/app'

# External
require '../trackr/web/app'

rack_stack = RackStack.app do
  run Kaavio.new, :when => {:host => /kaavio\.strozek\.\w+$/}
  run Strozek.new, :when => {:host => /strozek\.\w+$/}
  run Strozek.new, :when => {:host => /elevenseconds\.\w+$/}
  run Strozek.new, :when => {:host => /^\d+\.\d+\.\d+\.\d+$/}
  run LoveAndMathematics.new, :when => {:host => /loveandmathematics\.\w+$/}
  run Workshop11.new, :when => {:host => /workshop-11\.\w+$/}

  # External
  run Trackr.new, :when => {:host => /trackr\.\w+$/}
end

run rack_stack
