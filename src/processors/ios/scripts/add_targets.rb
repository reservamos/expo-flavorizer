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

# Check if flavor target already exists
flavor_target = project.targets.detect { |target| target.name == flavor }

# Clean up invalid file references in existing target if it exists
if flavor_target
  puts "Cleaning up invalid file references in existing target..."
  
  # Clean up build files with invalid file references
  flavor_target.build_phases.each do |phase|
    invalid_files = []
    
    phase.files.each do |build_file|
      # Check if the build file has a nil file_ref or if the file_ref isn't a proper file reference object
      if build_file.file_ref.nil? || 
         !build_file.file_ref.respond_to?(:real_path) || 
         (build_file.file_ref.respond_to?(:real_path) && !build_file.file_ref.real_path.exist? rescue true)
        invalid_files << build_file
      end
    end
    
    if !invalid_files.empty?
      puts "Removing #{invalid_files.count} invalid file references from #{phase.isa}"
      invalid_files.each do |file|
        phase.files.delete(file)
      end
    end
  end
end

# If flavor target doesn't exist, create it
if flavor_target.nil?
  puts "Creating new flavor target #{flavor}..."
  flavor_target = project.new_target(base_target.symbol_type, flavor, base_target.platform_name, base_target.deployment_target)
  flavor_target.product_name = flavor
else
  puts "Updating existing flavor target #{flavor}..."
end

# Ensure Flavors group exists
flavors_group = project.main_group.find_subpath('Flavors', true)

# Check if flavor group already exists and refresh its file references
if flavor_group = flavors_group.find_subpath(flavor, false)
  puts "Updating existing flavor #{flavor} group..."
  
  # First, completely remove all file references from the flavor group
  # This eliminates any chance of duplicate references
  puts "Cleaning all existing file references from the flavor group..."
  
  # Save a backup in case we need to keep the group structure without its files
  if !flavor_group.empty?
    # Remove all file references
    files_to_remove = flavor_group.files.dup
    files_to_remove.each do |file|
      puts "Removing file reference: #{file.path}"
      flavor_group.children.delete(file)
    end
    
    # Also clean up any subgroup
    subgroups_to_check = flavor_group.groups.dup
    subgroups_to_check.each do |subgroup|
      if !subgroup.empty?
        puts "Removing subgroup: #{subgroup.path}"
        flavor_group.children.delete(subgroup)
      end
    end
  end
else
  # Create flavor group if it doesn't exist
  puts "Creating new flavor group for #{flavor}..."
  flavor_group = flavors_group.new_group(flavor, flavor)
end

# Clean up stale references in build phases
if flavor_target
  puts "Cleaning up stale file references from build phases..."
  
  # Especially focus on resources phase which typically accumulates duplicates
  resources_phase = flavor_target.resources_build_phase
  
  puts "Cleaning ALL existing resources from Copy Bundle Resources phase..."
  
  # For existing targets, let's completely clear the resources phase to avoid duplication
  all_resource_files = resources_phase.files.dup
  all_resource_files.each do |file|
    begin
      if file.file_ref && file.file_ref.respond_to?(:path)
        puts "Removing resource: #{file.file_ref.path}"
        resources_phase.remove_build_file(file)
      else
        puts "Removing unidentified resource"
        resources_phase.remove_build_file(file)
      end
    rescue => e
      puts "Error removing resource: #{e.message}"
      # Try direct removal as fallback
      resources_phase.files.delete(file) rescue nil
    end
  end
  
  # Also clean up any other build phases that might have duplicates
  flavor_target.build_phases.each do |phase|
    # Skip non-resource phases
    next unless phase.isa == 'PBXResourcesBuildPhase' || phase.isa == 'PBXCopyFilesBuildPhase'
    
    # Track unique paths to detect duplicates
    unique_paths = {}
    duplicate_files = []
    
    # Find duplicate entries by path
    phase.files.each do |file|
      begin
        if file.file_ref && file.file_ref.respond_to?(:path)
          path = file.file_ref.path
          if unique_paths[path]
            duplicate_files << file
            puts "Found duplicate: #{path}"
          else
            unique_paths[path] = true
          end
        end
      rescue => e
        puts "Error checking for duplicates: #{e.message}"
      end
    end
    
    # Remove duplicate entries
    duplicate_files.each do |file|
      begin
        phase.remove_build_file(file)
        puts "Removed duplicate from #{phase.isa}"
      rescue => e
        puts "Error removing duplicate: #{e.message}"
        # Try direct removal as fallback
        phase.files.delete(file) rescue nil
      end
    end
  end
end

# Add/update references to flavor-specific files
flavor_dir = File.join(File.dirname(project_path), flavor)

if Dir.exist?(flavor_dir)
  # Add common files we expect in flavor directories
  [
    "Debug.entitlements", 
    "Debug.xcconfig", 
    "Release.entitlements",
    "Release.xcconfig",
    "PrivacyInfo.xcprivacy",
    "Info.plist", 
    "SplashScreen.storyboard"
  ].each do |filename|
    file_path = File.join(flavor_dir, filename)
    if File.exist?(file_path)
      # Check if a reference to this file already exists
      existing_ref = flavor_group.files.find { |f| f.path == file_path }
      if existing_ref.nil?
        file_ref = flavor_group.new_reference(file_path)
        puts "Added reference to #{filename}"
      else
        puts "Reference to #{filename} already exists"
      end
    end
  end
  
  # Add assets catalog if it exists
  assets_path = File.join(flavor_dir, "Images.xcassets")
  if File.exist?(assets_path)
    existing_ref = flavor_group.files.find { |f| f.path == assets_path }
    if existing_ref.nil?
      assets_ref = flavor_group.new_reference(assets_path)
      puts "Added reference to Images.xcassets"
    else
      puts "Reference to Images.xcassets already exists"
    end
  end
end

# If updating existing target, first clear build settings and keep original configurations
if flavor_target.build_phases.any?
  puts "Updating build settings for existing flavor target..."
else
  puts "Setting up new build phases and configurations..."
end

# Update build_configurations
flavor_target.build_configurations.map do |item|
  # If it's an existing target, keep original settings as base
  original_settings = item.build_settings.clone
  
  # Update with base target settings and new build settings
  item.build_settings = original_settings.merge(base_target.build_settings(item.name)).merge(build_settings)
  
  # Set flavor-specific paths
  if item.name == "Debug"
    item.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{flavor}/Debug.entitlements"
    item.build_settings['INFOPLIST_FILE'] = "#{flavor}/Info.plist"
    item.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon"
    item.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    item.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    item.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    item.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    item.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "$(SPLASH_SCREEN)"
    item.build_settings['PRODUCT_NAME'] = "$(BUNDLE_NAME)";
    item.build_settings['ENABLE_BITCODE'] = 'NO'
    
    # Set debug xcconfig if it exists
    debug_xcconfig_file = flavor_group.files.find { |file| file.path.end_with?("Debug.xcconfig") } if flavor_group
    item.base_configuration_reference = debug_xcconfig_file if debug_xcconfig_file
    elsif item.name == "Release"
    item.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{flavor}/Release.entitlements"
    item.build_settings['INFOPLIST_FILE'] = "#{flavor}/Info.plist"
    item.build_settings['ASSETCATALOG_COMPILER_APPICON_NAME'] = "AppIcon"
    item.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = "$(PRODUCT_BUNDLE_IDENTIFIER)"
    item.build_settings['MARKETING_VERSION'] = "$(MARKETING_VERSION)"
    item.build_settings['CURRENT_PROJECT_VERSION'] = "$(CURRENT_PROJECT_VERSION)"
    item.build_settings['INFOPLIST_KEY_CFBundleDisplayName'] = "$(DISPLAY_NAME)"
    item.build_settings['INFOPLIST_KEY_UILaunchStoryboardName'] = "$(SPLASH_SCREEN)"
    item.build_settings['PRODUCT_NAME'] = "$(BUNDLE_NAME)";
    item.build_settings['ENABLE_BITCODE'] = 'NO'
    
    # Set release xcconfig if it exists
    release_xcconfig_file = flavor_group.files.find { |file| file.path.end_with?("Release.xcconfig") } if flavor_group
    item.base_configuration_reference = release_xcconfig_file if release_xcconfig_file
  end
end

# Only set up build phases for new targets
if !flavor_target.build_phases.any?
  puts "Setting up build phases for new target..."
  
  # Copy build phases properly from base target to flavor target
  base_target.build_phases.each do |base_phase|
    case base_phase.isa
    when 'PBXSourcesBuildPhase'
      sources_phase = flavor_target.source_build_phase
      base_phase.files.each do |build_file|
        begin
          if build_file.file_ref && 
             build_file.file_ref.respond_to?(:real_path) && 
             build_file.file_ref.real_path.exist?
            sources_phase.add_file_reference(build_file.file_ref)
          end
        rescue => e
          puts "Skipping invalid source file reference: #{e.message}"
        end
      end
    when 'PBXResourcesBuildPhase'
      resources_phase = flavor_target.resources_build_phase
      # Track paths to avoid duplicates
      added_paths = []
      
      base_phase.files.each do |build_file|
        # Skip files with invalid references
        begin
          next if build_file.file_ref.nil? || 
                  !build_file.file_ref.respond_to?(:real_path) || 
                  !build_file.file_ref.real_path.exist?
          
          # Skip specific resources we don't want in flavor targets
          next if build_file.file_ref && 
                  build_file.file_ref.respond_to?(:path) && 
                  [
                    'Images.xcassets', 
                    'SplashScreen.storyboard'
                  ].any? { |name| build_file.file_ref.path.end_with?(name) }
        rescue => e
          puts "Skipping resource with invalid reference: #{e.message}"
          next
        end
        
        # Skip any privacy info file from the base target - multiple checks to ensure it's caught
        begin
          if build_file.file_ref && build_file.file_ref.respond_to?(:path)
            path = build_file.file_ref.path
            privacy_file = path.include?('PrivacyInfo') && path.end_with?('.xcprivacy') 
            base_privacy_file = path == 'example/PrivacyInfo.xcprivacy' || path == 'PrivacyInfo.xcprivacy'
            
            # Skip if it's any form of the base privacy file
            next if privacy_file && !path.include?(flavor)
          end
        rescue => e
          puts "Error checking privacy file: #{e.message}"
          next
        end
        
        # Skip if we've already added this path
        begin
          next if build_file.file_ref.respond_to?(:path) && added_paths.include?(build_file.file_ref.path)
        rescue => e
          puts "Error checking added paths: #{e.message}"
          next
        end
        
        # Keep resources from Supporting folder
        begin
          if build_file.file_ref && 
             build_file.file_ref.respond_to?(:path) && 
             build_file.file_ref.path.include?('Supporting')
            resources_phase.add_file_reference(build_file.file_ref)
            added_paths << build_file.file_ref.path
          # Add other resources that aren't in the excluded list
          elsif build_file.file_ref && build_file.file_ref.respond_to?(:path)
            resources_phase.add_file_reference(build_file.file_ref)
            added_paths << build_file.file_ref.path
          end
        rescue => e
          puts "Error adding resource: #{e.message}"
        end
      end
      
      # Add flavor-specific resources
      if flavor_group
        puts "Adding flavor-specific resources for #{flavor}"
        flavor_resources = flavor_group.files.select do |file|
          # Safely check if the file reference is valid and exists
          begin
            file.respond_to?(:real_path) && 
            file.real_path.exist? && 
            ['.xcassets', '.storyboard', '.plist', '.xcconfig', '.xcprivacy'].any? { |ext| file.path.end_with?(ext) } &&
            !added_paths.include?(file.path)
          rescue => e
            puts "Skipping invalid reference during resource gathering: #{e.message}"
            false
          end
        end
        
        flavor_resources.each do |resource|
          puts "Adding flavor resource: #{resource.path}"
          resources_phase.add_file_reference(resource)
          added_paths << resource.path
        end
      end
    when 'PBXFrameworksBuildPhase'
      frameworks_phase = flavor_target.frameworks_build_phase
      # Track paths to avoid duplicates
      added_framework_paths = []
      
      base_phase.files.each do |build_file|
        begin
          if build_file.file_ref && 
             build_file.file_ref.respond_to?(:real_path) && 
             build_file.file_ref.real_path.exist? && 
             build_file.file_ref.respond_to?(:path) && 
             !added_framework_paths.include?(build_file.file_ref.path)
            frameworks_phase.add_file_reference(build_file.file_ref)
            added_framework_paths << build_file.file_ref.path
          end
        rescue => e
          puts "Skipping framework with invalid reference: #{e.message}"
        end
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
      
      # Track paths to avoid duplicates
      added_copy_paths = []
      
      base_phase.files.each do |build_file|
        begin
          if build_file.file_ref && 
             build_file.file_ref.respond_to?(:real_path) && 
             build_file.file_ref.real_path.exist? && 
             build_file.file_ref.respond_to?(:path) && 
             !added_copy_paths.include?(build_file.file_ref.path)
            copy_files_phase.add_file_reference(build_file.file_ref)
            added_copy_paths << build_file.file_ref.path
          end
        rescue => e
          puts "Skipping copy file with invalid reference: #{e.message}"
        end
      end
    when 'PBXHeadersBuildPhase'
      headers_phase = flavor_target.headers_build_phase
      
      # Track paths to avoid duplicates
      added_header_paths = []
      
      base_phase.files.each do |build_file|
        begin
          if build_file.file_ref && 
             build_file.file_ref.respond_to?(:real_path) && 
             build_file.file_ref.real_path.exist? && 
             build_file.file_ref.respond_to?(:path) && 
             !added_header_paths.include?(build_file.file_ref.path)
            headers_phase.add_file_reference(build_file.file_ref)
            added_header_paths << build_file.file_ref.path
          end
        rescue => e
          puts "Skipping header with invalid reference: #{e.message}"
        end
      end
    end
  end

  # Copy target dependencies
  base_target.dependencies.each do |dep|
    dependency = flavor_target.add_dependency(dep.target)
  end
else
  # For existing targets, we should refresh resources to ensure new files are picked up
  if flavor_group && flavor_group.files.any?
    puts "Refreshing resources for existing target..."
    resources_phase = flavor_target.resources_build_phase
    
    # Track what we've already added to avoid duplicates
    added_resource_paths = []
    resources_phase.files.each do |file|
      begin
        if file.file_ref && file.file_ref.respond_to?(:path)
          added_resource_paths << file.file_ref.path
        end
      rescue => e
        puts "Error checking existing resource: #{e.message}"
      end
    end
    
    puts "Current resources count: #{added_resource_paths.length}"
    
    # We've already cleaned up resources from this flavor above,
    # so now we can add back all the files without risk of duplication
    flavor_resources = flavor_group.files.select do |file|
      begin
        file.respond_to?(:real_path) && 
        file.real_path.exist? && 
        file.respond_to?(:path) && 
        ['.xcassets', '.storyboard', '.plist', '.xcconfig', '.xcprivacy'].any? { |ext| file.path.end_with?(ext) } &&
        !added_resource_paths.include?(file.path)
      rescue => e
        puts "Skipping invalid reference during refresh: #{e.message}"
        false
      end
    end
    
    flavor_resources.each do |resource|
      begin
        puts "Adding flavor resource: #{resource.path}"
        resources_phase.add_file_reference(resource)
        added_resource_paths << resource.path
      rescue => e
        puts "Error adding resource: #{e.message}"
      end
    end
    
    puts "Resources after refresh: #{added_resource_paths.length}"
    
    # Final check for duplicates
    unique_paths = {}
    duplicate_files = []
    
    resources_phase.files.each do |file|
      begin
        if file.file_ref && file.file_ref.respond_to?(:path)
          path = file.file_ref.path
          if unique_paths[path]
            duplicate_files << file
            puts "Found duplicate after adding: #{path}"
          else
            unique_paths[path] = true
          end
        end
      rescue => e
        puts "Error in final duplicate check: #{e.message}"
      end
    end
    
    duplicate_files.each do |file|
      begin
        resources_phase.remove_build_file(file)
        puts "Removed duplicate in final check"
      rescue => e
        puts "Error removing duplicate in final check: #{e.message}"
      end
    end
  end
end

puts "Successfully #{flavor_target.build_phases.any? ? 'updated' : 'created'} flavor target '#{flavor}' from base target '#{project_name}'"

project.save