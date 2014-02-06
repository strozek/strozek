require 'rubygems'
require 'sqlite3'

sql_file = File.open('kaavio.sql', 'r') { |f| f.read } 

begin
    
    db = SQLite3::Database.open "kaavio.db"
    db.execute_batch sql_file
    
rescue SQLite3::Exception => e 
    
    puts "Exception occured"
    puts e
    
ensure
    db.close if db
end

