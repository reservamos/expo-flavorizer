require 'xcodeproj'
require 'json'
require 'base64'

if ARGV.length != 5
  puts 'We need exactly 5 arguments'
  exit
end

project_path = ARGV[0]
xcconfig_reference = ARGV[1]
project_name = ARGV[2]
flavor = ARGV[3]
additional_build_settings = JSON.parse(Base64.decode64(ARGV[4]))

project = Xcodeproj::Project.open(project_path)
base_target = project.targets.detect { |target| target.name == project_name }

# create target
flavor_target = project.new_target(base_target.symbol_type, flavor, base_target.platform_name, base_target.deployment_target)
flavor_target.product_name = flavor

# create scheme
flavor_scheme = Xcodeproj::XCScheme.new
flavor_scheme.add_build_target(flavor_target)
flavor_scheme.set_launch_target(flavor_target)
flavor_scheme.save_as(project_path, flavor, true)

# find xcconfig file
xcconfig_file = project.files.detect { |file| file.path == xcconfig_reference }

# copy build_configurations
flavor_target.build_configurations.map do |item|
  item.build_settings.update(base_target.build_settings(item.name))
  item.base_configuration_reference = xcconfig_file
end

# copy build_phases
base_target.build_phases.each do |phase|
  flavor_build_phase = flavor_target.build_phases.find { |flavor_phase| flavor_phase.display_name == phase.display_name }
  if flavor_build_phase.nil?
    flavor_target.build_phases.push(phase)
  else
    phase.files_references.each do |file|
      flavor_build_phase.add_file_reference(file)
    end
  end
end

project.save