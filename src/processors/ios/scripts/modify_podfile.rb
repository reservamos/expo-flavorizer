require 'fileutils'

if ARGV.length != 2
    puts 'We need exactly two arguments'
    exit
end

podfile_path = ARGV[0]
project_name = ARGV[1]

podfile_content = File.read(podfile_path)
target_base_block = /target '#{project_name}' do\s*(.*?)^\s*end/m

match_data = target_base_block.match(podfile_content)

if match_data
  example_content = match_data[1].gsub("\\'", "'").strip
end


abstract_target_block = <<-RUBY
abstract_target 'common' do
  #{example_content}

  target 'banana' do
  end

  target 'apple' do
  end
end
RUBY

new_podfile_content = podfile_content.gsub(target_base_block, abstract_target_block)
File.write(podfile_path, new_podfile_content)
