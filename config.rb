require 'slim'
require 'bootstrap-sass'
require 'date'

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

helpers do

  def pl_month (date)
    months = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
      "lipca", "sierpnia", "września", "października", "listopada", "grudnia"]
    ret = months[date.strftime('%m').to_i-1]
  end


end
activate :blog do |blog|
  blog.name = "carousel"
  blog.sources = "carousel/{year}-{month}-{day}-{title}.html"
end

activate :blog do |blog|
  blog.name = "lectures"
  blog.sources = "lectures/{year}-{month}-{day}-{title}.html"
end

activate :blog do |blog|
  blog.name = "news"
  blog.sources = "news/{year}-{month}-{day}-{title}.html"
end


page "/feed.xml", layout: false

configure :build do
  activate :minify_css
  activate :minify_javascript
end

set :css_dir, "stylesheets"

set :js_dir, "javascripts"
