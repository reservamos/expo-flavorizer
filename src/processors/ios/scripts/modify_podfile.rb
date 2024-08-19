require 'fileutils'

if ARGV.length != 2
    puts 'We need exactly two arguments'
    exit
end

podfile_path = ARGV[0]
project_name = ARGV[1]

podfile_content = File.read(podfile_path)
target_base_block = /target '#{project_name}' do(.+?)end/m
puts target_base_block
match_data = target_base_block.match(podfile_content)
puts match_data
example_content = match_data[1].strip if match_data

abstract_target_block = <<-RUBY
abstract_target 'common' do
  #{example_content}

  target 'example' do
  end

  target 'example-dev' do
  end
end
RUBY

new_podfile_content = podfile_content.gsub(target_base_block, abstract_target_block)
File.write(podfile_path, new_podfile_content)
