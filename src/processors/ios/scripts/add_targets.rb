require 'xcodeproj'
require 'json'
require 'base64'
require 'fileutils'

if ARGV.length != 4
  puts 'We need exactly 4 arguments'
  exit
end

project_path = ARGV[0]
project_name = ARGV[1]
flavor = ARGV[2]
build_settings = JSON.parse(Base64.decode64(ARGV[3]))

puts "Opening project at #{project_path}..."
project = Xcodeproj::Project.open(project_path)
base_target = project.targets.detect { |target| target.name == project_name }

if base_target.nil?
  puts "Error: Could not find base target '#{project_name}'"
  exit
end

# Check if flavor target already exists
flavor_target = project.targets.detect { |target| target.name == flavor }
is_new_target = flavor_target.nil?

# If flavor target doesn't exist, create it
if is_new_target
  puts "Creating new flavor target #{flavor}..."
  flavor_target = project.new_target(base_target.symbol_type, flavor, base_target.platform_name, base_target.deployment_target)
  flavor_target.product_name = flavor
else
  puts "Updating existing flavor target #{flavor}..."
end

# Get the flavor directory structure
ios_dir = File.dirname(project_path)
flavor_dir = File.join(ios_dir, "Flavors", flavor)
puts "Using flavor directory: #{flavor_dir}"

# Ensure Flavors group exists in the project
main_group = project.main_group
flavors_group = main_group.find_subpath('Flavors', true)
puts "Flavors group #{flavors_group ? 'found' : 'created'}"

# Find or create the flavor group
flavor_group = flavors_group.find_subpath(flavor, false)
if flavor_group.nil?
  flavor_group = flavors_group.new_group(flavor)
  puts "Created new flavor group for #{flavor}"
else
  puts "Using existing flavor group for #{flavor}"
  # Remove any existing file references to avoid duplicates
  flavor_group.clear
  puts "Cleared existing file references from flavor group"
end

# Clean up dangling references in the project
puts "Cleaning up any dangling references..."
project.objects.each do |object|
  # Skip non-reference objects
  next unless object.is_a?(Xcodeproj::Project::Object::AbstractObject)
  
  # Skip objects that don't respond to file_ref
  next unless object.respond_to?(:file_ref)
  
  # If file_ref is nil or not a valid reference, remove the build file
  if object.file_ref.nil? || !object.file_ref.uuid
    puts "Removing dangling reference: #{object.display_name}"
    object.remove_from_project
  end
end

# Clean up invalid configuration references
project.targets.each do |target|
  puts "Checking configuration references for target: #{target.name}"
  target.build_configurations.each do |config|
    # Check if the base_configuration_reference is invalid
    if config.base_configuration_reference && (!config.base_configuration_reference.uuid || !config.base_configuration_reference.real_path)
      puts "Removing invalid base_configuration_reference in #{config.name} for target #{target.name}"
      config.base_configuration_reference = nil
    end
  end
end

# Helper function to check if a file exists
def file_exists?(filepath)
  File.exist?(filepath)
end

# Helper function to add a file reference
def add_file_reference(project, group, filepath)
  return nil unless file_exists?(filepath)
  
  begin
    # First check if this file already has a reference in the project
    existing_refs = project.files.select do |file| 
      begin
        file.real_path.to_s == File.absolute_path(filepath)
      rescue
        # Skip files that don't have a valid real_path
        false
      end
    end
    
    # Remove any existing references to avoid duplicate group membership
    existing_refs.each do |ref|
      ref.remove_from_project rescue nil
    end
    
    # Create a new file reference directly in the specified group
    file_ref = group.new_file(filepath)
    puts "Added reference to #{filepath}"
    return file_ref
  rescue => e
    puts "Error adding file reference for #{filepath}: #{e.message}"
    return nil
  end
end

# Helper function to check if a file reference is valid
def valid_file_reference?(file_ref)
  return false if file_ref.nil?
  
  begin
    # Check if the file still exists
    path = file_ref.real_path.to_s
    return File.exist?(path)
  rescue
    return false
  end
end

# List of common files we expect to exist in the flavor directory
expected_files = [
  "Debug.entitlements",
  "Release.entitlements",
  "Debug.xcconfig",
  "Release.xcconfig",
  "Info.plist",
  "PrivacyInfo.xcprivacy",
  "SplashScreen.storyboard"
]

# Add references to flavor-specific files (expected to be created by other processors)
added_files = {}

expected_files.each do |filename|
  filepath = File.join(flavor_dir, filename)
  if file_exists?(filepath)
    file_ref = add_file_reference(project, flavor_group, filepath)
    if file_ref
      added_files[filepath] = file_ref
      puts "Added #{filename} to Xcode project"
    else
      puts "Failed to add #{filename} to Xcode project"
    end
  else
    puts "Warning: Expected file #{filename} does not exist at #{filepath}"
  end
end

# Add Images.xcassets if it exists
images_dir = File.join(flavor_dir, "Images.xcassets")
if Dir.exist?(images_dir)
  images_ref = add_file_reference(project, flavor_group, images_dir)
  if images_ref
    added_files[images_dir] = images_ref
    puts "Added Images.xcassets to Xcode project"
  else
    puts "Failed to add Images.xcassets to Xcode project"
  end
else
  puts "Warning: Images.xcassets directory does not exist at #{images_dir}"
end

# Get resources phase 
resources_phase = flavor_target.resources_build_phase

# Clean up the resources phase first to remove invalid references
puts "Cleaning up resources phase..."
resources_to_remove = []
resources_phase.files.each do |build_file|
  if !build_file.file_ref || !valid_file_reference?(build_file.file_ref)
    resources_to_remove << build_file
  end
end

resources_to_remove.each do |build_file|
  puts "Removing invalid build file from resources phase: #{build_file.display_name}"
  resources_phase.remove_build_file(build_file)
end

# Clear the resources phase to rebuild it with valid references
resources_phase.clear
puts "Cleared resources phase"

# Get source and frameworks phases
sources_phase = flavor_target.source_build_phase
frameworks_phase = flavor_target.frameworks_build_phase

# Clean up invalid references in sources phase
puts "Cleaning up sources phase..."
sources_to_remove = []
sources_phase.files.each do |build_file|
  if !build_file.file_ref || !valid_file_reference?(build_file.file_ref)
    sources_to_remove << build_file
  end
end

sources_to_remove.each do |build_file|
  puts "Removing invalid build file from sources phase: #{build_file.display_name}"
  sources_phase.remove_build_file(build_file)
end

# Clean up invalid references in frameworks phase
puts "Cleaning up frameworks phase..."
frameworks_to_remove = []
frameworks_phase.files.each do |build_file|
  if !build_file.file_ref || !valid_file_reference?(build_file.file_ref)
    frameworks_to_remove << build_file
  end
end

frameworks_to_remove.each do |build_file|
  puts "Removing invalid build file from frameworks phase: #{build_file.display_name}"
  frameworks_phase.remove_build_file(build_file)
end

# Helper function to safely add a file reference to a build phase
def add_file_to_build_phase(build_phase, file_ref)
  return false if file_ref.nil? || !valid_file_reference?(file_ref)
  
  # Check if file is already in the build phase
  existing = build_phase.files.find { |build_file| build_file.file_ref == file_ref }
  return true if existing
  
  begin
    build_phase.add_file_reference(file_ref)
    return true
  rescue => e
    puts "Error adding file to build phase: #{e.message}"
    return false
  end
end

# If this is a new target, set up build phases
if is_new_target
  puts "Setting up build phases for new target..."
  
  # Copy build phases from base target
  base_target.build_phases.each do |base_phase|
    case base_phase.isa
    when 'PBXSourcesBuildPhase'
      # Copy source files
      base_phase.files.each do |build_file|
        next if build_file.file_ref.nil?
        add_file_to_build_phase(sources_phase, build_file.file_ref)
      end
      
    when 'PBXFrameworksBuildPhase'
      # Copy frameworks
      base_phase.files.each do |build_file|
        next if build_file.file_ref.nil?
        add_file_to_build_phase(frameworks_phase, build_file.file_ref)
      end
      
    when 'PBXResourcesBuildPhase'
      # Only copy non-flavor resources
      base_phase.files.each do |build_file|
        next if build_file.file_ref.nil?
        
        path = ""
        begin
          path = build_file.file_ref.real_path.to_s
        rescue
          next # Skip files that can't be resolved
        end
        
        # Get filename to check for specific files to skip
        filename = File.basename(path)
        
        # Skip flavor-specific files and Info.plist
        skip = path.include?("Images.xcassets") || 
               path.include?("SplashScreen") || 
               path.include?("Info.plist") || 
               path.include?(".entitlements") || 
               path.include?(".xcconfig") || 
               path.include?("Flavors/") ||
               filename == "Info.plist" ||
               filename == "PrivacyInfo.xcprivacy"
        
        add_file_to_build_phase(resources_phase, build_file.file_ref) unless skip
      end
      
    when 'PBXShellScriptBuildPhase'
      # Copy shell script phase
      script_phase = flavor_target.new_shell_script_build_phase
      script_phase.name = base_phase.name
      script_phase.shell_script = base_phase.shell_script
      script_phase.shell_path = base_phase.shell_path
      script_phase.input_paths = base_phase.input_paths.dup rescue []
      script_phase.output_paths = base_phase.output_paths.dup rescue []
      
    when 'PBXCopyFilesBuildPhase'
      # Copy files phase
      copy_phase = flavor_target.new_copy_files_build_phase
      copy_phase.name = base_phase.name
      copy_phase.dst_path = base_phase.dst_path
      copy_phase.dst_subfolder_spec = base_phase.dst_subfolder_spec
      
      base_phase.files.each do |build_file|
        next if build_file.file_ref.nil?
        add_file_to_build_phase(copy_phase, build_file.file_ref)
      end
    end
  end
  
  # Copy dependencies
  base_target.dependencies.each do |dep|
    begin
      flavor_target.add_dependency(dep.target)
    rescue => e
      puts "Error adding dependency: #{e.message}"
    end
  end
end

# Add all flavor-specific resource files to the resources phase
added_files.each do |path, file_ref|
  filename = File.basename(path)
  extension = File.extname(path).downcase
  
  # Skip Info.plist and PrivacyInfo.xcprivacy files as they're handled by build settings
  next if filename == "Info.plist" || filename == "PrivacyInfo.xcprivacy"
  
  if extension == ".storyboard" || 
     extension == ".xcassets" || 
     extension == ".png" || 
     extension == ".jpg" || 
     extension == ".plist" || 
     extension == ".strings" || 
     extension == ".bundle" ||
     path.include?("Images.xcassets")
    if add_file_to_build_phase(resources_phase, file_ref)
      puts "Added #{filename} to resources phase"
    else
      puts "Failed to add #{filename} to resources phase"
    end
  end
end

# Make sure we have the Supporting/Expo.plist file in resources
supporting_group = project.main_group.find_subpath('Supporting', false)
if supporting_group
  expo_plist = supporting_group.find_file_by_path('Expo.plist')
  if expo_plist && valid_file_reference?(expo_plist)
    if add_file_to_build_phase(resources_phase, expo_plist)
      puts "Added Supporting/Expo.plist to resources phase"
    else
      puts "Failed to add Supporting/Expo.plist to resources phase"
    end
  else
    puts "Warning: Could not find valid reference to Supporting/Expo.plist"
  end
end

# Find xcconfig files
debug_xcconfig = added_files.find { |path, ref| path.end_with?("Debug.xcconfig") }
release_xcconfig = added_files.find { |path, ref| path.end_with?("Release.xcconfig") }

# Update build configurations
flavor_target.build_configurations.each do |config|
  puts "Updating #{config.name} configuration..."
  
  # Keep existing settings
  original_settings = config.build_settings.clone
  
  # Add base target and provided build settings
  config.build_settings = original_settings.merge(
    base_target.build_settings(config.name)
  ).merge(build_settings)
  
  # Set flavor-specific paths with proper paths
  if config.name == "Debug"
    # Set path to Info.plist file
    config.build_settings['INFOPLIST_FILE'] = "Flavors/#{flavor}/Info.plist"
    
    # Set path to entitlements file
    config.build_settings['CODE_SIGN_ENTITLEMENTS'] = "Flavors/#{flavor}/Debug.entitlements"
    
    # Set app icon name
    config.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon"
    
    # Set path to privacy info file
    config.build_settings['PRIVACY_MANIFEST_PATH'] = "Flavors/#{flavor}/PrivacyInfo.xcprivacy"
    
    # Let xcconfig handle these values
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    config.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    config.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    config.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    
    # Set splash screen with proper path
    config.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "SplashScreen"
    
    config.build_settings['PRODUCT_NAME'] = "$(BUNDLE_NAME)"
    config.build_settings['ENABLE_BITCODE'] = 'NO'
    
    # Set Debug.xcconfig as base configuration reference
    if debug_xcconfig && valid_file_reference?(debug_xcconfig[1])
      config.base_configuration_reference = debug_xcconfig[1]
      puts "Set Debug.xcconfig as base configuration reference"
    else
      # If the xcconfig reference is invalid, set it to nil
      config.base_configuration_reference = nil
      puts "Warning: Debug.xcconfig reference is invalid or nil"
    end
  elsif config.name == "Release"
    # Set path to Info.plist file
    config.build_settings['INFOPLIST_FILE'] = "Flavors/#{flavor}/Info.plist"
    
    # Set path to entitlements file
    config.build_settings['CODE_SIGN_ENTITLEMENTS'] = "Flavors/#{flavor}/Release.entitlements"
    
    # Set app icon name
    config.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon"
    
    # Set path to privacy info file
    config.build_settings['PRIVACY_MANIFEST_PATH'] = "Flavors/#{flavor}/PrivacyInfo.xcprivacy"
    
    # Let xcconfig handle these values
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    config.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    config.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    config.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    
    # Set splash screen with proper path
    config.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "SplashScreen"
    
    config.build_settings['PRODUCT_NAME'] = "$(BUNDLE_NAME)"
    config.build_settings['ENABLE_BITCODE'] = 'NO'
    
    # Set Release.xcconfig as base configuration reference
    if release_xcconfig && valid_file_reference?(release_xcconfig[1])
      config.base_configuration_reference = release_xcconfig[1]
      puts "Set Release.xcconfig as base configuration reference"
    else
      # If the xcconfig reference is invalid, set it to nil
      config.base_configuration_reference = nil
      puts "Warning: Release.xcconfig reference is invalid or nil"
    end
  end
end

# Final cleanup of project before saving
puts "Performing final cleanup of project..."
project.targets.each do |target|
  # Remove any references to nil in build phases
  target.build_phases.each do |phase|
    if phase.respond_to?(:files)
      phase.files.reject! { |file| file.nil? || file.file_ref.nil? }
    end
  end
end

# Save the project
begin
  project.save
  puts "✅ Flavor target #{flavor} setup complete!"
rescue => e
  puts "❌ Error saving project: #{e.message}"
  puts e.backtrace.join("\n")
  exit 1
end