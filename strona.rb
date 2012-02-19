require 'sinatra'

set :haml, :layout_engine => :erb

def data_dir dir, data, limit = nil
    files = Dir["data/#{dir}/*"].sort
    files = files[-limit..-1] if limit and files.length > limit
    files.map do |file|
        File.read(file) =~ /#{'(.*?)\n' * (data.length-1)}(.*)/m
        m = Regexp.last_match
        Hash[data.map.with_index { |key,i| [key, m[i+1]] }]
    end
end

def carousel
    data_dir :carousel, [:img, :header, :content]
end

def news limit=nil
    data_dir :news, [:header, :date, :author, :content], limit
end

def lectures limit=nil
    data_dir :lectures, [:header, :date, :author, :content], limit
end

get '/' do
    @active_page = :main
    haml :main
end

get '/news' do
    @active_page = :news
    haml :news
end

get '/wyklady' do
    @active_page = :lectures
    haml :lectures
end

get '/o_nas' do
    @active_page = :about
    haml :about
end

get '/kontakt' do
    @active_page = :contact
    haml :contact
end
