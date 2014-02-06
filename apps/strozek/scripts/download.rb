require 'rubygems'
require 'mechanize'

puts "Type in your password"
system "stty -echo"
pass = gets.chomp
system "stty echo"

a = Mechanize.new
a.user_agent_alias = 'Mac Safari'

page = a.get('http://onegsb.stanford.edu')
login = page.form('login')
login.username = 'strozek'
login.password = pass
page2 = a.submit(login, login.buttons.first)
page3 = a.submit(page2.forms.first, page2.forms.first.buttons.first)
url = 'https://onegsb.stanford.edu/directory/student?field_program_year_value=79751'
while(url != nil)
  portal = a.get(url)
  portal.images.each { |image|
    name = image.text
    puts "image is "+name+" at "+image.url.to_s
    if(name != "")
      user = portal.link_with(:text => name)
      puts "user is "+user.text+" at "+user.href.to_s
      if(user != nil)
        userPage = a.get("https://onegsb.stanford.edu" + user.href.to_s)
        i = a.get(userPage.images.first.url)
        puts "image is "+i.uri.to_s
        i.save_as(name+".jpg")
        email = userPage.links.select { |link| link.href =~ /^mailto/ }.first.text
        puts "* Found "+name+" at "+email
      end
    end
  }
  link = portal.link_with(:text => "next \342\200\272")
  if(link != nil)
    url = 'https://onegsb.stanford.edu' + link.href
  else
    url = nil
  end
end
