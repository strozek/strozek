require 'rubygems'
require 'sinatra'
require 'sinatra/base'
require 'json'
require 'digest/md5'
require 'sqlite3'
require 'gcm'
require 'base64'

# use Rack::Deflater
set :port, 80
set :bind, '0.0.0.0'
set :server, %w[thin webrick]
# set :static_cache_control, [:public, :max_age => 2678400]
# set :sessions, true

API_KEY = 'AIzaSyAf5B_Kmh7krNaz27OmNuPH1OZ2qy1WUzs'

def INFO(s)
  open(File.dirname(__FILE__) + '/public/appLog.html', 'a') { |f|
    f.puts(Time.new.strftime("%Y-%m-%d %H:%M:%S\tINFO\t")+s)
  }
end

def sendNotification(db, userId, message)
  gcm = GCM.new(API_KEY)
  rows = db.execute('select deviceId from deviceRegistrations where userId = ?', userId)
  reg_ids = []
  rows.each do |row|
    reg_ids.push(row[0])
  end
  options = {:data => {:message => message.to_json}}
  response = gcm.send_notification(reg_ids, options)
  count = reg_ids.count
  INFO("Notification send to #{count} <span onClick='javascript:popup(this, \""+reg_ids.join(',<br>')+"\")'>device(s)</span><br>\n")
  return {:status => response[:response]}
end

# TODO: This should not exist in the final version
def get_or_post(path, opts={}, &block)
  get(path, opts, &block)
  post(path, opts, &block)
end


class Workshop11 < Sinatra::Base

  dbFile = File.dirname(__FILE__) + "/db/data.db"

  get '/' do
    erb :index, :locals => {:environment => settings.environment.to_s} 
  end

  get '/info' do
    erb :info, :locals => {:environment => settings.environment.to_s,
                           :host => request.host}
  end

  get_or_post '/registerDevice' do # :userId, :deviceRegId
    INFO("Ensuring <span onClick='javascript:popup(this, \""+params[:deviceRegId]+"\")'>device</span> is registered for user "+params[:userId]+"<br>\n")
    db = SQLite3::Database.open dbFile
    result = db.get_first_value("select count(*) from deviceRegistrations where userID = ? and deviceId = ?",
      [params[:userId].to_i, params[:deviceRegId]])
    if(result == 0)
      db.execute("insert into deviceRegistrations (userId, deviceId) values (?, ?)",
        [params[:userId].to_i, params[:deviceRegId]])
    end
    db.close
    # TODO: change this to return failure if failure occurred
    result = {:status => "success"}
    result.to_json
  end

  get_or_post '/addOrGetUser' do # :firstName, :lastName, :phone, :email, :photoEncoded
    INFO("Creating or returning user #{params[:firstName]} #{params[:lastName]} with email #{params[:email]} and phone #{params[:phone]}<br>\n")
    db = SQLite3::Database.open dbFile
    id = db.get_first_value("select id from users where firstName = ? and lastName = ? and phone = ? and email = ?",
        [params[:firstName], params[:lastName], params[:phone], params[:email]])
    if(id == nil)
      db.execute("insert into users (firstName, lastName, phone, email, notes) values (?, ?, ?, ?, '')",
        [params[:firstName], params[:lastName], params[:phone], params[:email]])
      id = db.last_insert_row_id
      INFO("Created new user, ID #{id}<br>\n");
      if(params[:photoEncoded]!="")
        File.open("public/photos/#{id}.jpg", 'wb') {|f| f.write(Base64.decode64(params[:photoEncoded]))}
      end
    else
      INFO("Found user, ID #{id}<br>\n");
    end
    # TODO: Deal with notes
    result = {:status => "success", :userId => id}
    db.close
    result.to_json
  end

  get_or_post '/getUserFromId' do # :userId
    INFO("Fetching user #{params[:userId]}<br>\n")
    db = SQLite3::Database.open dbFile
    row = db.get_first_row("select firstName, lastName, phone, email, notes from users where id = ?", params[:userId])
    # TODO: Deal with notes
    result = {:status => "success", :firstName => row[0], :lastName => row[1], :phone => row[2], :email => row[3]}
    db.close
    result.to_json
  end

  get_or_post '/requestContact' do # :requestorId, :targetId
    INFO("User #{params[:requestorId]} requested contact for user #{params[:targetId]}<br>\n")
    db = SQLite3::Database.open dbFile
    message = {:command => 'requestContact', :requestorId => params[:requestorId].to_i}
    result = sendNotification(db, params[:targetId].to_i, message)
    db.close
    result.to_json
  end

  get_or_post '/respondToRequest' do # :requestorId, :targetId, :doApprove
    INFO("User "+params[:targetId]+" responded to request of user "+params[:requestorId]+" with status "+params[:doApprove]+"<br>\n")
    db = SQLite3::Database.open dbFile
    doApprove = (params[:doApprove]=="true")
    message = {:command => 'respondToRequest', :targetId => params[:targetId].to_i, :doApprove => doApprove}
    result = sendNotification(db, params[:requestorId].to_i, message)
    db.close
    result.to_json
  end

  get_or_post '/postHeardUser' do # :userId, :userHeardId, :userIdsInRange, :timestamp
    INFO("User "+params[:userId]+" heard user "+params[:userHeardId]+" with timestamp "+params[:timestamp]+" and users in range "+params[:userIdsInRange]+"<br>\n")
    db = SQLite3::Database.open dbFile
    # TODO: Deal with timestamp somehow
    inRangeIncludingSelf = params[:userId]+","+params[:userIdsInRange]
    message = {:command => 'addUserToList', :userId => params[:userId].to_i, :userIdsInRange => inRangeIncludingSelf}
    result = sendNotification(db, params[:userHeardId].to_i, message)
    db.close
    result.to_json
  end
 
  get_or_post '/pull' do
    db = SQLite3::Database.open dbFile
    users = db.execute "select id, firstName, lastName, phone, email, notes from users"
    results = []
    users.each do |row|
      result = {
          :id => row[0],
          :firstName => row[1],
          :lastName => row[2],
          :phone => row[3],
          :email => row[4],
          :notes => row[5]=='' ? nil : row[5]
      }
      results.push(result)
    end
    db.close
    results.to_json
  end

end
