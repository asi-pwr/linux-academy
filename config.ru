require "./strona"

Dir.chdir File.dirname __FILE__
run Sinatra::Application
