#!/usr/bin/env ruby
require 'xcodeproj'

# This script fixes common issues in Xcode projects that can cause problems with CocoaPods
# Usage: ruby fix_xcode_references.rb <project_path>

# Helper methods - defined at the top of the file
def valid_setting?(value)
  # Simple validation - could be expanded
  return true if value.nil?
  return false if value.is_a?(String) && value.include?('$(SRCROOT)') && value.include?('/../')
  true
end

def find_valid_info_plist(project, target_name)
  # Try to find a valid Info.plist for the target
  possible_paths = [
    "#{target_name}/Info.plist",
    "#{target_name.downcase}/Info.plist",
    "Flavors/#{target_name}/Info.plist",
    "Flavors/#{target_name.downcase}/Info.plist"
  ]
  
  possible_paths.each do |path|
    if File.exist?(File.join(File.dirname(project.path), path))
      return path
    end
  end
  
  # Default to a standard location
  return "$(SRCROOT)/#{target_name}/Info.plist"
end

if ARGV.length != 1
  puts 'Usage: ruby fix_xcode_references.rb <project_path>'
  exit
end

project_path = ARGV[0]
puts "Fixing Xcode project references in: #{project_path}"

begin
  # Open the Xcode project
  project = Xcodeproj::Project.open(project_path)
  
  # Track if we made any changes
  changes_made = false
  
  puts "Checking for invalid build configurations..."
  
  # Fix build configurations that might be causing "undefined method 'source_tree'" errors
  project.targets.each do |target|
    puts "Checking target: #{target.name}"
    
    target.build_configurations.each do |config|
      # Check for build settings with potentially invalid references
      problematic_settings = ['INFOPLIST_FILE', 'CODE_SIGN_ENTITLEMENTS', 'CONFIGURATION_BUILD_DIR']
      
      problematic_settings.each do |setting_key|
        if config.build_settings[setting_key] && !valid_setting?(config.build_settings[setting_key])
          puts "  - Found potentially problematic setting: #{setting_key} = #{config.build_settings[setting_key]}"
          
          # Remove or fix the problematic setting
          if setting_key == 'INFOPLIST_FILE'
            # Try to find a valid Info.plist path
            config.build_settings[setting_key] = find_valid_info_plist(project, target.name) || config.build_settings[setting_key]
          elsif setting_key == 'CODE_SIGN_ENTITLEMENTS'
            # Remove if it's causing issues
            puts "    - Clearing problematic entitlements setting"
            config.build_settings.delete(setting_key)
            changes_made = true
          elsif setting_key == 'CONFIGURATION_BUILD_DIR'
            # Fix the build dir path if it's causing issues
            if config.build_settings[setting_key].include?('$(SRCROOT)')
              puts "    - Fixing build directory path"
              config.build_settings[setting_key] = "$(BUILD_DIR)/$(CONFIGURATION)$(EFFECTIVE_PLATFORM_NAME)"
              changes_made = true
            end
          end
        end
      end
      
      # Check for base_configuration_reference issues
      if config.base_configuration_reference && 
         (!config.base_configuration_reference.respond_to?(:source_tree) ||
          !config.base_configuration_reference.real_path.exist? rescue true)
        puts "  - Found invalid base_configuration_reference in #{config.name} for target #{target.name}"
        config.base_configuration_reference = nil
        changes_made = true
      end
    end
  end
  
  # Look for file references with invalid paths
  puts "Checking for invalid file references..."
  project.files.each do |file_ref|
    begin
      # Skip files that don't cause problems
      next if file_ref.path.nil? || file_ref.path.empty?
      
      # Try to access properties that might cause errors
      test_properties = lambda do
        file_ref.source_tree
        file_ref.real_path if file_ref.respond_to?(:real_path)
      end
      
      test_properties.call
    rescue => e
      puts "  - Found invalid file reference: #{file_ref.path}"
      puts "    - Error: #{e.message}"
      
      # Try to fix the source_tree if that's the problem
      if !file_ref.respond_to?(:source_tree) || file_ref.source_tree.nil?
        puts "    - Setting source_tree to GROUP"
        file_ref.source_tree = "<group>" 
        changes_made = true
      end
    end
  end
  
  # Save the project if changes were made
  if changes_made
    puts "Saving fixed Xcode project..."
    project.save
    puts "✅ Fixed Xcode project saved successfully!"
  else
    puts "✅ No issues found that needed fixing."
  end
  
rescue => e
  puts "❌ Error fixing Xcode project: #{e.message}"
  puts e.backtrace
  exit 1
end 