require 'xcodeproj'

# Script to clean ExpoModulesProvider.swift references that might conflict after applying flavors
# Usage: ruby clean_expo_modules_refs.rb <project_path> <project_name>

if ARGV.length != 2
  puts 'We need exactly 2 arguments: project_path and project_name'
  exit
end

project_path = ARGV[0]
project_name = ARGV[1]

# Open the Xcode project
project = Xcodeproj::Project.open(project_path)

# Find the base target
base_target = project.targets.detect { |target| target.name == project_name }

if base_target.nil?
  puts "Target '#{project_name}' not found in project"
  exit
end

# Find and remove ExpoModulesProvider.swift references
removed_count = 0

# Helper method to find a group by name recursively
def find_group_by_name(group, name)
  return group if group.display_name == name
  
  group.children.each do |child|
    if child.is_a?(Xcodeproj::Project::Object::PBXGroup)
      result = find_group_by_name(child, name)
      return result if result
    end
  end
  
  nil
end

# Find the ExpoModulesProviders group using recursive search
expo_modules_providers = find_group_by_name(project.main_group, 'ExpoModulesProviders')

if expo_modules_providers
  # Find the group for the project_name
  project_group = expo_modules_providers.children.find { |child| child.display_name == project_name }
  
  if project_group
    # Find ExpoModulesProvider.swift files with old path pattern
    files_to_remove = []
    project_group.files.each do |file_ref|
      if file_ref.path.end_with?('ExpoModulesProvider.swift') && 
         (file_ref.path.include?('/Pods-') && !file_ref.path.include?('/Pods-common-'))
        files_to_remove << file_ref
        puts "Found outdated reference: #{file_ref.path}"
      end
    end
    
    # Remove the files from the source build phase
    source_build_phase = base_target.source_build_phase
    if source_build_phase
      source_build_phase.files.each do |build_file|
        if build_file.file_ref && files_to_remove.include?(build_file.file_ref)
          # Store the path before removing the build file
          file_path = build_file.file_ref.path
          source_build_phase.remove_build_file(build_file)
          puts "Removed build file reference for: #{file_path}"
          removed_count += 1
        end
      end
    end
    
    # Remove the file references
    files_to_remove.each do |file_ref|
      puts "Removing file reference: #{file_ref.path}"
      file_ref.remove_from_project
      removed_count += 1
    end
  end
end

# Check if any references were removed
if removed_count > 0
  puts "Successfully removed #{removed_count} outdated ExpoModulesProvider.swift references"
  project.save
else
  puts "No outdated ExpoModulesProvider.swift references found"
end
