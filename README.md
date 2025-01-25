strozek
=======

A collection of personal utilities, demos, and showcases

* `/`: pulls up the static about page (generated with hugo)
* `/status`: returns `OK`
* `/info`: returns host/environment name
* `/dice`: returns an animation of rolled dice (see https://www.elevenseconds.com/tvd/from-the-archives-ephemeral-dice-and-fire-effects)
* `/fire`: returns an animation of a torch (see https://www.elevenseconds.com/tvd/from-the-archives-ephemeral-dice-and-fire-effects)
* `/luck`: luck simulator (see https://www.elevenseconds.com/tvd/what-is-luck)
* `/truthtable`: truth table generator (see https://www.elevenseconds.com/tvd/truth-table-generator)
* `/zoom`: zoom effect generator (see https://www.elevenseconds.com/tvd/the-zoom-effect)
* `/disappear/bw/:text`: create an image that includes the string "text" that disappears when printed in B&W (see https://www.elevenseconds.com/tvd/disappearing-messages)
* `/disappear/color/:text/:distraction`: create an image that includes a decoy string "distraction" that disappears and a secret "text" appears when printed in B&W
* `/pictionary/:word_group`: a site that helps run family pictionary games
* `/wordgame/:player`: a site that helps run family taboo games
** `/wordgame/commands/list`
** POST `/wordgame/commands`
* `/loveandmath` or `https://loveandmathematics.us`: our wedding website
* `/panda` or `https://pandaprotection.info`: the panda protection website made by my daughter
* `/crowdsource`: the crowdsourcing project (see https://www.elevenseconds.com/tvd/crowdsourced-art), written in 2009
** `/crowdsource/makeMeAToken/:salt/:amount`: creae a token, given the secret salt, and the number of pixels
** `/crowdsource/listMeTheTokens/:salt`: list all tokens in the system
* `/mazeandgirl`: a maze game designed by my daughter (1st grade)
* `/logo`: a simple LOGO interpreter
* `/money`: a "savings account" simulator, allowing kids to explore how long-term savings works
* `/landrun`: a platform game designed by my daughter (4th grade)
* `/musicnotepad`: a notepad for music composition
* `/static_sites/A-Level-Allocator/enter.html`: An exploration tool for British Mathematics A-Levels (see https://www.elevenseconds.com/archive/early-websites-2001), built in 2001
* `/static_sites/German-Grammar-Test/index.html`: A simple german grammar test (see https://www.elevenseconds.com/archive/early-websites-2001), built in 2001
* `/static_sites/js-objects.html`: A demo of jquery UI-like objects I built in 2005 (see https://www.elevenseconds.com/archive/javascript-objects-2005)

#### Files not in the repository

* `/config/secrets/SALT.rb`: the `SALT` variable used in `crowdsource.rb`
* `/config/secrets/SESSION_SECRET.rb`: the `SESSION_SECRET` variable used in `strozek.rb`
* `/data/crowdsource.db`: sqlite database that manages the crowdsource project. database is auto-generated if it doesn't exist
* `/data/crowdsource.lock`: a lock file to avoid concurrent edits to the crowdsourced image
* `/data/crowdsource.png`: the most recent crowdsourced image
* `/log/crowdsource.log`: the logfile for the crowdsource application
* `log/unicorn.stderr.log`: (prod only) automatically generated
* `log/unicorn.stdout.log`: (prod only) automatically generated
* `tmp/pids/unicorn.pig`: (prod only) Unicorn's PID
* `tmp/sockets/unicorn.sock`: (prod only) Unicorn's socket
* `version.txt`: one line of the format X.Y.Z (e.g. 1.0.0), autoincremented when `scripts/up` is run to deploy to prod


#### localhost system setup

```shell
### prep

# install brew - check https://brew.sh/ for up-to-date instructions
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

# install XCode - may already be installed with brew
xcode-select --install

# not sure this is needed - last time I tried, gave me an error
sudo xcodebuild -license

# ensure all dotfiles are set up, especially ~/.ssh/config

### get ruby 2.7.1

curl -L https://get.rvm.io | bash -s stable

# put the following in ~/.bash_profile:
export GEM_HOME="$GEM_HOME:$HOME/.rvm/bin"
export GEM_PATH="$GEM_PATH:$HOME/.rvm/bin"

# needed if shell window not closed/reopened
source /Local/Users/strozek/.rvm/scripts/rvm

rvm get stable --auto-dotfiles
sudo chown -R $(whoami) /usr/local/bin
chmod u+w /usr/local/bin
rvm install 2.7.1
rvm --default use 2.7.1

# shared
gem install rack 	# 2.2.3
gem install sinatra 	# 2.1.0
gem install unicorn 	# 5.7.0

# shared - local-only
gem install thin		# 1.7.2
gem install rerun 		# 0.13.0

# only strozek
gem install sequel		# sequel (5.38.0)
gem install sqlite3		# sqlite3 (1.4.2)
brew install ImageMagick@6
gem install rmagick		# rmagick (4.1.2)

# to run locally
./scripts/local
```

#### Bitnami production setup
```shell
sudo dpkg-reconfigure tzdata
sudo apt install ruby 		# ruby 2.3.1p112 (2016-04-26) [x86_64-linux-gnu]
sudo apt-get install ruby-dev
sudo gem install unicorn	# unicorn (5.4.1)
sudo gem install sinatra	# sinatra (2.0.4)
sudo apt-get install libsqlite3-dev
sudo gem install sqlite3	# sqlite3 (1.3.13)
sudo gem install sequel		# sequel (5.13.0)
# edited /opt/bitnami/nginx/conf/bitnami
# edited /opt/bitnami/nginx/conf/nginx.conf
# created /opt/bitnami/apps/root
# deleted /opt/bitnami/apps/phpmyadmin
# emptied /opt/bitnami/nginx/html
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto
sudo ~/certbot-auto --nginx --nginx-server-root /opt/bitnami/nginx/conf
sudo ~/certbot-auto --nginx-server-root /opt/bitnami/nginx/conf --cert-name strozek.com -d strozek.com -d www.strozek.com -d balances.strozek.com
# periodically: sudo ~/certbot-auto renew

# not sure any of these are needed
sudo apt-get install pkg-config
sudo apt-get install libmagickwand-dev
sudo apt-get install libmagick++-dev
sudo apt-get install libmagickcore-dev

sudo PKG_CONFIG_PATH=/opt/bitnami/common/lib/pkgconfig gem install rmagick
```
