module StrozekHelpers

	class Crowdsource

	  DATA_DIR = File.expand_path(File.dirname(__FILE__) + "/data")
	  PUBLIC_DIR = File.expand_path(File.dirname(__FILE__) + "/public")
	  WIDTH = 67
	  HEIGHT = 67
	  SCALE = 6 
	  @db = nil
	  @log = nil
	  @picker = nil

	  include Magick

	  def initialize
		  @picker = Image.read("#{PUBLIC_DIR}/images/graphics/picker.png").first
	    @log = File.new("log/crowdsource.log", 'a')
	    @db = Sequel.connect("sqlite://#{DATA_DIR}/crowdsource.db")
	    if(@db.tables.length == 0)
	      lock do
	        createTables
	      end 
	      cacheImage
	    end 
	  end

	  def close
	    @log.close
	    @db.disconnect
	  end
		
		def lock
	    file = "#{DATA_DIR}/crowdsource.lock"
		  f = File.open(file, File::RDWR|File::CREAT, 0644)
	    begin
	      Timeout::timeout(2) {f.flock(File::LOCK_EX)}
	    rescue Exception => e
	      nil
	    end
	    yield
	    f.close
	  end
		
		def showAllTokens
		  output = "<style> .usedUp {color:#cccccc;} </style>"
		  output += "<table border=1 cellpadding=3><tr><td>token</td><td>amount</td></tr>"
		  @db[:tokens].each { |row|
		    amount = tokenAmount(row[:token])
		    output += "<tr>"
	      output += "<td" + (row[:invalid] ? ' class="usedUp"' : '') + ">" + row[:token] + "</td>"
	      output += "<td" + (row[:invalid] ? ' class="usedUp"' : '') + ">" + amount.to_s + "</td>"
	      output += "</tr>"
		  }
		  output += "</table>"
		  return output
		end
		
		def tokenAmount(token)
		  token =~ /(\w{3})\w{6}/
		  return ($1.to_i(16)**1.25).round
		end
		
		def tokenInfo(token)
		  if(token==nil || token.length!=12)
		    return nil
		  end
		  token =~ /(\w{3})(\w{3})(\w{6})/
		  amount = $1
		  origin = $2
		  hash = $3
		  if(Digest::SHA1.hexdigest("#{amount}#{SALT}#{origin}")[0, 6] == hash &&
		     @db[:tokens].where(:token => token, :invalid => true).count == 0)
		    return [amount.to_i(16), origin.to_i(16), tokenAmount(token)]
		  else
		    return nil
		  end
		end
		
		def makeToken(amount)
	    origin = 0
		  while(true)
		    amountHex = amount.to_s(16).rjust(3, '0')
		    originHex = origin.to_s(16).rjust(3, '0')
	      hash = Digest::SHA1.hexdigest("#{amountHex}#{SALT}#{originHex}")[0, 6]
		    token = "#{amountHex}#{originHex}#{hash}"
		    break if (@db[:tokens].where(:token => token).count == 0)
		    origin = origin+1
	    end
		  @db[:tokens].insert(:token => token, :invalid => false)
		  return token
		end

	  def log(message)
	    @log.puts(message)
	  end
		
		def invalidateToken(token)
		  @db[:tokens].where(:token => token).update(:invalid => true)
		end
		
		def createTables
		  @db.create_table :pixels do
		    primary_key :id
		    int :location
		    int :color
		    String :token
		  end
		  @db.create_table :tokens do
		    primary_key :id
		    String :token
		    bool :invalid
		  end
	    @db.create_table :challenges do
	      primary_key :id
	      int :randomInt
	      bool :complete
	    end
		end
		
		def makeImage
		  image = Image.new(WIDTH, HEIGHT)
		  image.transparent_color = 'white'
		  image = image.transparent('white')
		  image.format = "PNG"
		  @db[:pixels].each { |row|
		    x = row[:location]%67
		    y = row[:location]/67
		    cx = row[:color]%125
		    cy = row[:color]/125
		    image.pixel_color(x, y, @picker.pixel_color(cx, cy))
		  }
		  return image
		end

	  def image
	    return Image.read("#{DATA_DIR}/crowdsource.png").first
	  end
		
		def getOverlapCount(art)
		  count = 0
	    if(art)
	      art.split(',').each { |item|
		      items = item.split(':')
		      if(@db[:pixels].where(:location => items[0].to_i).count != 0)
		        count = count+1
		      end
		    }
		  end
		  return count
		end

	  def requestMineChallenge
	    seed = rand(360000);
	    hash = Digest::SHA1.hexdigest("mine.#{seed}")
	    id = @db[:challenges].insert(:randomInt => seed, :complete => false)
	    result = {:success => true, :id => id, :hash => hash}
	    return result
	  end

	  def solveMineChallenge(id, seed)
	    dataset = @db[:challenges].where(:id => id, :randomInt => seed, :complete => false)
	    if(dataset.count != 0)
	      dataset.update(:complete => true)
	      result = {:success => true, :token => makeToken(10)}
	    else
	      result = {:success => false}
	    end
	    return result
	  end

		def submitContribution(art, token)
		  art.split(',').each { |item|
		    items = item.split(':')
		    if(@db[:pixels].where(:location => items[0].to_i).count != 0)
		      @db[:pixels].where(:location => items[0].to_i).update(:color => items[1].to_i, :token => token)
		    else
		      @db[:pixels].insert(:location => items[0].to_i, :color => items[1].to_i, :token => token)
		    end
		  }
		end
		
		def cacheImage
		  image = makeImage
		  image.resize!(WIDTH*SCALE, HEIGHT*SCALE, PointFilter)
		  c = Pixel.new(0, 0, 0, 0.7*MaxRGB)
		  c2 = Pixel.new(MaxRGB, 0, MaxRGB)
		  white = Pixel.new(0, 0, 0, MaxRGB)
		  for y in 0..(HEIGHT-1)
		    for x in 0..(WIDTH-1)
		      if(image.pixel_color(x*SCALE, y*SCALE) == white)
		        image.pixel_color(x*SCALE+(SCALE/2)-1, y*SCALE+(SCALE/2)-1, c2)
		        for a in 0..(SCALE-1)
		          image.pixel_color(x*SCALE+a, (y+1)*SCALE-1, c)
		          image.pixel_color((x+1)*SCALE-1, y*SCALE+a, c)
		        end
		      end
		    end
		  end
		  image.write("#{DATA_DIR}/crowdsource.png")
		end

	end

end
