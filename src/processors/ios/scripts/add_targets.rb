require 'xcodeproj'
require 'json'
require 'base64'

if ARGV.length != 4
  puts 'We need exactly 4 arguments'
  exit
end

project_path = ARGV[0]
project_name = ARGV[1]
flavor = ARGV[2]
build_settings = JSON.parse(Base64.decode64(ARGV[3]))

project = Xcodeproj::Project.open(project_path)
base_target = project.targets.detect { |target| target.name == project_name }

# create target
flavor_target = project.new_target(base_target.symbol_type, flavor, base_target.platform_name, base_target.deployment_target)
flavor_target.product_name = flavor

# create scheme
# flavor_scheme = Xcodeproj::XCScheme.new
# flavor_scheme.add_build_target(flavor_target)
# flavor_scheme.set_launch_target(flavor_target)
# flavor_scheme.save_as(project_path, flavor, true)

# copy build_configurations
flavor_target.build_configurations.map do |item|
  item.build_settings.update(base_target.build_settings(item.name))
  item.build_settings = item.build_settings.merge(build_settings)
end

# Remove default build phases that were automatically created
flavor_target.build_phases.clear

# Copy build phases properly from base target to flavor target
base_target.build_phases.each do |base_phase|
  case base_phase.isa
  when 'PBXSourcesBuildPhase'
    sources_phase = flavor_target.source_build_phase
    base_phase.files.each do |build_file|
      sources_phase.add_file_reference(build_file.file_ref) if build_file.file_ref
    end
  when 'PBXResourcesBuildPhase'
    resources_phase = flavor_target.resources_build_phase
    base_phase.files.each do |build_file|
      resources_phase.add_file_reference(build_file.file_ref) if build_file.file_ref
    end
  when 'PBXFrameworksBuildPhase'
    frameworks_phase = flavor_target.frameworks_build_phase
    base_phase.files.each do |build_file|
      frameworks_phase.add_file_reference(build_file.file_ref) if build_file.file_ref
    end
  when 'PBXShellScriptBuildPhase'
    shell_script_phase = flavor_target.new_shell_script_build_phase
    shell_script_phase.name = base_phase.name
    shell_script_phase.shell_script = base_phase.shell_script
    shell_script_phase.shell_path = base_phase.shell_path
    shell_script_phase.input_paths = base_phase.input_paths
    shell_script_phase.output_paths = base_phase.output_paths
  when 'PBXCopyFilesBuildPhase'
    copy_files_phase = flavor_target.new_copy_files_build_phase
    copy_files_phase.name = base_phase.name
    copy_files_phase.dst_path = base_phase.dst_path
    copy_files_phase.dst_subfolder_spec = base_phase.dst_subfolder_spec
    base_phase.files.each do |build_file|
      copy_files_phase.add_file_reference(build_file.file_ref) if build_file.file_ref
    end
  when 'PBXHeadersBuildPhase'
    headers_phase = flavor_target.headers_build_phase
    base_phase.files.each do |build_file|
      headers_phase.add_file_reference(build_file.file_ref) if build_file.file_ref
    end
  end
end

# Copy target dependencies
base_target.dependencies.each do |dep|
  dependency = flavor_target.add_dependency(dep.target)
end

puts "Successfully created flavor target '#{flavor}' from base target '#{project_name}'"

project.save