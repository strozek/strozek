strozek
=======

A collection of personal utilities, demos, and showcases

* `/status`: returns `OK`
* `/info`: returns host/environment name
* `/dice`: returns an animation of rolled dice
* `/fire`: returns an animation of a torch
* `/luck`: luck simulator
* `/truthtable`: truth table generator
* `/zoom`: zoom effect generator
* `/disappear/bw/:text`: create an image that includes the string "text" that disappears when printed in B&W
* `/disappear/color/:text/:distraction`: create an image that includes a decoy string "distraction" that disappears and a secret "text" appears when printed in B&W
* `/crowdsource`: the crowdsourcing project
* `/crowdsource/makeMeAToken/:salt/:amount`: creae a token, given the secret salt, and the number of pixels
* `/crowdsource/listMeTheTokens/:salt`: list all tokens in the system

#### TODO

* loveandmath host

#### Files not in the repository

* `/config/secrets/SALT.rb`: the `SALT` variable used in `crowdsource.rb`
* `/config/secrets/SESSION_SECRET.rb`: the `SESSION_SECRET` variable used in `strozek.rb`

#### Localhost system setup
```shell
brew install ImageMagick@6
# maybe, brew install rbenv ruby-build
# maybe, install Command Line Tools MacOS 10.14 for XCode 10.3 from https://developer.apple.com/download/more/
open /Library/Developer/CommandLineTools/Packages/ # and run the installer there
sudo gem install rmagick
```