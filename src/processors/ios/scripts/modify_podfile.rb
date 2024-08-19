require 'fileutils'

if ARGV.length != 2
    puts 'We need exactly two arguments'
    exit
end

podfile_path = ARGV[0]
project_name = ARGV[1]

podfile_content = File.read(podfile_path, encoding: 'UTF-8')

targets = podfile_content.split('target \'')
# split the podfile content into initial block and abstract_target block
initial_block = targets.first

additional_targets_block =''
# Define regex pattern to find all target blocks
pattern_targets = /target '([^']+)' do/m

# Find all targets
matches = podfile_content.scan(pattern_targets)

if matches.length > 1
    # Get the position of the second target
    second_target_start = podfile_content.index(matches[1][0])

    # Extract content from the second target to the end of the file
    additional_targets_block = "\ntarget \'" + podfile_content[second_target_start..-1].strip
end

abstract_target_block = "abstract_target 'common' do" \
"\n  use_expo_modules!" \
"\n"\
"\n  if ENV['EXPO_UNSTABLE_CORE_AUTOLINKING'] == '1'"\
"\n    Pod::UI.puts('Using expo-modules-autolinking as core autolinking source'.green)"\
"\n    config_command = ["\
"\n      'node',"\
"\n      '--no-warnings',"\
"\n      '--eval',"\
"\n      'require(require.resolve(\\\'expo-modules-autolinking\\\', { paths: [require.resolve(\\\'expo/package.json\\\')] }))(process.argv.slice(1))',"\
"\n      'react-native-config',"\
"\n      '--json',"\
"\n      '--platform',"\
"\n      'ios'"\
"\n    ]"\
"\n    config = use_native_modules!(config_command)"\
"\n  else"\
"\n    config = use_native_modules!"\
"\n  end"\
"\n"\
"\n  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']"\
"\n  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']"\
"\n"\
"\n  use_react_native!("\
"\n    :path => config[:reactNativePath],"\
"\n    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',"\
"\n    # An absolute path to your application root."\
"\n    :app_path => \"\#{Pod::Config.instance.installation_root}/..\","\
"\n    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false',"\
"\n  )"\
"\n"\
"\n  post_install do |installer|"\
"\n    react_native_post_install("\
"\n      installer,"\
"\n      config[:reactNativePath],"\
"\n      :mac_catalyst_enabled => false,"\
"\n      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',"\
"\n    )"\
"\n"\
"\n    # This is necessary for Xcode 14, because it signs resource bundles by default"\
"\n    # when building for devices."\
"\n    installer.target_installation_results.pod_target_installation_results"\
"\n      .each do |pod_name, target_installation_result|"\
"\n      target_installation_result.resource_bundle_targets.each do |resource_bundle_target|"\
"\n        resource_bundle_target.build_configurations.each do |config|"\
"\n          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'"\
"\n        end"\
"\n      end"\
"\n    end"\
"\n  end"\
"\n"\
"\n  post_integrate do |installer|"\
"\n    begin"\
"\n      expo_patch_react_imports!(installer)"\
"\n    rescue => e"\
"\n      Pod::UI.warn e"\
"\n    end"\
"\n  end"\
"\n"\
"\n  target 'example' do"\
"\n  end"\
"\n"\
"\n  target 'banana' do"\
"\n  end"\
"\n"\
"\n  target 'apple' do"\
"\n  end"\
"\nend"\
"\n"

new_podfile_content = initial_block + abstract_target_block + additional_targets_block
File.write(podfile_path, new_podfile_content, mode: 'w', encoding: 'UTF-8')
