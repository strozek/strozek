require 'sinatra'
require 'sinatra/base'
$LOAD_PATH << './lib'
require 'rack-stack'

require './apps/strozek/app'
require './apps/kaavio/app'
require './apps/loveandmathematics/app'
require './apps/workshop11/app'
require './apps/ies/app'

rack_stack = RackStack.app do
  run Strozek.new, :when => {:host => /strozek\.\w+$/}
  run Strozek.new, :when => {:host => /elevenseconds\.\w+$/}
  run Strozek.new, :when => {:host => /^\d+\.\d+\.\d+\.\d+$/}
  run Kaavio.new, :when => {:host => /kaav\.\w+$/}
  run LoveAndMathematics.new, :when => {:host => /loveandmathematics\.\w+$/}
  run Workshop11.new, :when => {:host => /workshop-11\.\w+$/}
  run IES.new, :when => {:host => /ies\.tinyte\.\w+$/}
end

run rack_stack
