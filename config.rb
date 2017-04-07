require 'slim'
require 'bootstrap-sass'
require 'date'
require 'pry'

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

helpers do

  def pl_month (date)
    months = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
      "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]
    ret = months[date.strftime('%m').to_i-1]
  end

  def carousel_articles(index)
    articles = Dir["source/carousel/*"].sort.reverse
    file = File.new(articles[index])
    ret = {}
    while (line = file.gets)
      line = line.split(': ')
      ret[line[0]] = line[1]
    end
    ret
  end  

end


activate :blog do |blog|
  blog.name = "lectures"
  blog.sources = "lectures/{year}-{month}-{day}-{title}.html"
end

activate :blog do |blog|
  blog.name = "news"
  blog.sources = "news/{year}-{month}-{day}-{title}.html"
end

activate :pry

page "/feed.xml", layout: false

configure :build do
  activate :minify_css
  activate :minify_javascript
end

set :css_dir, "stylesheets"

set :js_dir, "javascripts"
