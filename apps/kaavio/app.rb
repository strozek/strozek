require 'sinatra'
require 'sinatra/base'
require 'sqlite3'
require 'json'

set :port, 80
set :bind, '0.0.0.0'
set :server, %w[thin webrick]

class Kaavio < Sinatra::Base

  dbFile = File.dirname(__FILE__) + "/db/kaavio.db"

  get '/' do
    erb :index
  end
  get '/hq/:team/:secret' do
    db = SQLite3::Database.open dbFile
    secret = params[:secret]
    team = params[:team]
    user = db.get_first_row('SELECT id, email, firstname, lastname FROM user WHERE secret = ?', secret)
    if(user == nil) 
      result = {:status => 1, :message => 'You need to provide the proper credentials'}
    else
      userID = user[0]
      badgesLeft = db.get_first_value('SELECT badgecount FROM userteam WHERE userid = ? AND teamid = ?', [userID, team])
      if(badgesLeft == nil)
        result = {:status => 1, :message => 'You are not a member of this team'}
      else
        teamName = db.get_first_value('SELECT name FROM team WHERE id = ?', team)
        q = db.execute('SELECT b.id, b.name FROM userbadge ub INNER JOIN badge b ON b.id=ub.badgeid WHERE userid = ? AND teamid = ?', [userID, team])
        badgesReceived = {}
        q.each do |row|
          if(badgesReceived[row[1]] == nil)
            badgesReceived[row[1]] = 0
	        end
          badgesReceived[row[1]] = badgesReceived[row[1]] + 1
        end
        q = db.execute 'SELECT id, name FROM badge b'
        badges = {}
        q.each do |row|
          badges[row[0]] = row[1]
        end
        q = db.execute('SELECT u.id, u.firstName, u.lastName FROM user u INNER JOIN userteam ut ON u.id = ut.userid WHERE ut.teamid = ?', team)
        users = {}
        q.each do |row|
          users[row[0]] = row[1]+' '+row[2]
        end
        result = {:status => 0, :userID => userID, :teamName => teamName, :firstName => user[2], :lastName => user[3], :badgesLeft => badgesLeft, :badgesReceived => badgesReceived, :badges => badges, :users => users}
      end
    end
    db.close
    result.to_json
  end 
  get '/board/:team/:badge' do
    db = SQLite3::Database.open dbFile
    q = db.execute('SELECT u.firstName, u.lastName FROM user u INNER JOIN userbadge ub ON u.id = ub.userid WHERE ub.teamID = ? AND ub.badgeid = ?', [params[:team], params[:badge]])
    board = {}
    q.each do |row|
      name = row[0]+' '+row[1]
      board[name] = 0 if(board[name] == nil)
      board[name] = board[name]+1
    end
    result = {:status => 0, :board => board}
    db.close
    result.to_json
  end
  get '/feed/:team' do
    db = SQLite3::Database.open dbFile
    q = db.execute('SELECT source.firstName, source.lastName, target.firstName, target.lastName,
                           b.name, ub.timestamp, ub.description 
                    FROM userbadge ub
		                INNER JOIN user source ON source.id = ub.useridgiver
		                INNER JOIN user target ON target.id = ub.userid
		                INNER JOIN badge b ON b.id = ub.badgeid
		                WHERE ub.teamid = ? ORDER BY ub.timestamp DESC', params[:team])
    result = {:status => 0, :activity => q}
    db.close
    result.to_json
  end
  post '/award' do
    db = SQLite3::Database.open dbFile 
    secret = params[:secret]
    target = params[:target]
    teamID = params[:teamID]
    badge = params[:badge]
    comment = params[:comment]
    userID = db.get_first_value('SELECT id FROM user WHERE secret = ?', secret)
    if(userID == nil) 
      result = {:status => 1, :message => 'You need to provide the proper credentials'}
    else
      targetuser = db.get_first_value('SELECT COUNT(*) FROM userteam WHERE userid = ? AND teamid = ?', [target, teamID])
      if(targetuser != 1)
        result = {:status => 1, :message => 'That user is not on your team'}
      else
        badgecount = db.get_first_value('SELECT badgecount FROM userteam WHERE userid = ? AND teamid = ?', [userID, teamID])
        if(badgecount == nil)
          result = {:status => 1, :message => 'You are not on this team'}
        elsif(badgecount == 0)
          result = {:status => 1, :message => 'You have no more badges to give out'}
        else
          db.execute('INSERT INTO userbadge SELECT ?, ?, ?, ?, ?, ?', [target, userID, teamID, badge, Time.now.to_i, comment])
          db.execute('UPDATE userteam SET badgecount = badgecount-1 WHERE userid = ? AND teamid = ?', [userID, teamID])
          result = {:status => 0}
        end
      end
    end
    db.close
    result.to_json
  end
end
