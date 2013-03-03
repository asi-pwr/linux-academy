# encoding: utf-8
require 'erubis'
require 'sinatra'
require 'atom'

set :haml, :layout_engine => :erb
$number_of_news = 2
$number_of_lectures = 5

def data_dir dir, data, limit = nil
    files = Dir["data/#{dir}/*"].sort.reverse
    files = files[0...limit] if limit and files.length > limit
    files.map do |file|
        File.read(file) =~ /#{'(.*?)\n' * (data.length-1)}(.*)/m
        m = Regexp.last_match
        Hash[data.map.with_index { |key,i| [key, m[i+1]] } + [:type, dir]]
    end
end

def carousel
    data_dir :carousel, [:img, :header, :content]
end

def news limit=nil
    data_dir :news, [:header, :date, :author, :content], limit
end

def lectures limit=nil
    data_dir :lectures, [:header, :date, :place, :author, :content], limit
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

get '/atom' do
    content_type 'application/atom+xml'
    Atom::Feed.new do |feed|
        feed.title = "Linux Acedemy"
        feed.links << Atom::Link.new(:href => 'http://linuxacademy.pl')
        feed.updated = [File.mtime('data/news'), File.mtime('data/lectures')].max
        feed.id = 'http://linuxacademy.pl/'
        entries = news($number_of_news) + lectures($number_of_lectures)
        entries = entries.sort_by { |e| e[:date] }
        entries.each do |entry|
            feed.entries << Atom::Entry.new do |e|
                e.title = entry[:header]
                e.links << Atom::Link.new(:href => 'http://linuxacademy.pl/')
                e.id = "http://linuxacademy.pl/#{entry[:type]}/#{entry[:date]}"
                e.content = Atom::Content::Html.new(markdown entry[:content])
                e.authors << entry[:author]
            end
        end
    end.to_xml
end
