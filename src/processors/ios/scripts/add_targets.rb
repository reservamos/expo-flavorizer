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

# Ensure Flavors group exists
flavors_group = project.main_group.find_subpath('Flavors', true)

# Check if flavor group already exists
flavor_group = flavors_group.find_subpath(flavor, false)
if flavor_group.nil?
  # Create flavor group if it doesn't exist
  flavor_group = flavors_group.new_group(flavor, flavor)
  
  # Add references to flavor-specific files if they exist
  flavor_dir = File.join(File.dirname(project_path), flavor)
  
  if Dir.exist?(flavor_dir)
    # Add common files we expect in flavor directories
    [
      "Debug-#{flavor}.entitlements", 
      "Debug-#{flavor}.xcconfig", 
      "Release-#{flavor}.entitlements",
      "Release-#{flavor}.xcconfig",
      "PrivacyInfo-#{flavor}.xcprivacy",
      "Info-#{flavor}.plist", 
      "SplashScreen-#{flavor}.storyboard"
    ].each do |filename|
      file_path = File.join(flavor_dir, filename)
      if File.exist?(file_path)
        file_ref = flavor_group.new_reference(file_path)
      end
    end
    
    # Add assets catalog if it exists
    assets_path = File.join(flavor_dir, "Images-#{flavor}.xcassets")
    if File.exist?(assets_path)
      assets_ref = flavor_group.new_reference(assets_path)
    end
  end
end

# copy build_configurations
flavor_target.build_configurations.map do |item|
  item.build_settings.update(base_target.build_settings(item.name))
  item.build_settings = item.build_settings.merge(build_settings)
  
  # Set flavor-specific paths
  if item.name == "Debug"
    item.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{flavor}/Debug-#{flavor}.entitlements"
    item.build_settings['INFOPLIST_FILE'] = "#{flavor}/Info-#{flavor}.plist"
    item.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon-#{flavor}"
    item.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    item.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    item.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    item.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    item.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "$(SPLASH_SCREEN)"
    
    # Set debug xcconfig if it exists
    debug_xcconfig_file = flavor_group.files.find { |file| file.path.end_with?("Debug-#{flavor}.xcconfig") } if flavor_group
    item.base_configuration_reference = debug_xcconfig_file if debug_xcconfig_file
    elsif item.name == "Release"
    item.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{flavor}/Release-#{flavor}.entitlements"
    item.build_settings['INFOPLIST_FILE'] = "#{flavor}/Info-#{flavor}.plist"
    item.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon-#{flavor}"
    item.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    item.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    item.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    item.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    item.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "$(SPLASH_SCREEN)"
    
    # Set release xcconfig if it exists
    release_xcconfig_file = flavor_group.files.find { |file| file.path.end_with?("Release-#{flavor}.xcconfig") } if flavor_group
    item.base_configuration_reference = release_xcconfig_file if release_xcconfig_file
  end
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
      # Skip specific resources we don't want in flavor targets
      next if build_file.file_ref && [
        'Images.xcassets', 
        'SplashScreen.storyboard'
      ].any? { |name| build_file.file_ref.path.end_with?(name) }
      
      # Skip any privacy info file from the base target - multiple checks to ensure it's caught
      if build_file.file_ref
        path = build_file.file_ref.path
        privacy_file = path.include?('PrivacyInfo') && path.end_with?('.xcprivacy') 
        base_privacy_file = path == 'example/PrivacyInfo.xcprivacy' || path == 'PrivacyInfo.xcprivacy'
        
        # Skip if it's any form of the base privacy file
        next if privacy_file && !path.include?(flavor)
      end
      
      # Keep resources from Supporting folder
      if build_file.file_ref && build_file.file_ref.path.include?('Supporting')
        resources_phase.add_file_reference(build_file.file_ref)
      # Add other resources that aren't in the excluded list
      elsif build_file.file_ref
        resources_phase.add_file_reference(build_file.file_ref)
      end
    end
    
    # Add flavor-specific resources
    if flavor_group
      puts "Adding flavor-specific resources for #{flavor}"
      flavor_resources = flavor_group.files.select do |file|
        ['.xcassets', '.storyboard', '.plist', '.xcconfig', '.xcprivacy'].any? { |ext| file.path.end_with?(ext) }
      end
      
      flavor_resources.each do |resource|
        puts "Adding flavor resource: #{resource.path}"
        resources_phase.add_file_reference(resource)
      end
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