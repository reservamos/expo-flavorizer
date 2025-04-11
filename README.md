# Expo Flavorizer

A utility to easily create flavors in your Expo/RN applications

## What is Expo Flavorizer?

Expo Flavorizer helps you create and manage multiple variants (flavors) of your React Native/Expo app from a single codebase. This is particularly useful when you need to:

- Create white-label applications with different branding (icons, splash screens, colors)
- Maintain separate development, staging, and production environments with different app IDs
- Deploy apps with different configurations to app stores (Free vs Premium versions)
- Create variants of your app for different clients or markets

With Expo Flavorizer, you can maintain a single codebase while generating multiple app variants with their own:

- App names and identifiers
- Icons and splash screens
- Configuration values
- Build settings

## Getting Started

Let's start by setting up our environment in order to run expo-flavorizer

### Prerequisites

> **IMPORTANT DISCLAIMER**: For best results, run Expo Flavorizer on a clean project.
>
> Before applying flavor changes to an existing project, it's highly recommended to run:
>
> ```shell
> npx expo prebuild --clean
> ```
>
> This command will clean your native projects and ensure they're in a pristine state before flavorization. Running Expo Flavorizer on existing complex projects with many modifications may cause conflicts.
>
> All functionality has been tested using the following environment configuration. Different versions of tools may produce different results:
>
> ```
> expo-env-info 1.2.2 environment info:
>   System:
>     OS: macOS 15.4
>     Shell: 5.9 - /bin/zsh
>   Binaries:
>     Node: 22.14.0 - /opt/homebrew/bin/node
>     Yarn: 1.22.22 - /opt/homebrew/bin/yarn
>     npm: 10.9.2 - /opt/homebrew/bin/npm
>     Watchman: 2025.03.10.00 - /opt/homebrew/bin/watchman
>   Managers:
>     CocoaPods: 1.16.2 - /opt/homebrew/bin/pod
>   SDKs:
>     iOS SDK:
>       Platforms: DriverKit 24.4, iOS 18.4, macOS 15.4, tvOS 18.4, visionOS 2.4, watchOS 11.4
>     Android SDK:
>       API Levels: 30, 31, 33, 34, 35
>       Build Tools: 30.0.3, 33.0.1, 34.0.0, 35.0.0
>       System Images: android-35 | Google Play ARM 64 v8a
>   IDEs:
>     Android Studio: 2024.3 AI-243.24978.46.2431.13208083
>     Xcode: 16.3/16E140 - /usr/bin/xcodebuild
>   npmGlobalPackages:
>     eas-cli: 16.1.0
>   Expo Workflow: managed
> ```

Since some processors reference existing files and expect a specific base structure, running expo-flavorizer on a heavily modified project could result in errors.

Before running expo-flavorizer, you must install the following
software:

- [Ruby](https://www.ruby-lang.org/en/documentation/installation/)
- [Gem](https://rubygems.org/pages/download)
- [Xcodeproj](https://github.com/CocoaPods/Xcodeproj) (through RubyGems)

These prerequisites are needed to manipulate the iOS and macOS projects and
schemes. If you are interested in flavorizing Android only, you can skip
this step.

### Installation

This package is intended to support development of react native projects. In
general, you can install it globally using:

```shell
yarn global add @reservamos/expo-flavorizer
```

or using `NPM`

```shell
npm -g install @reservamos/expo-flavorizer
```

## Create your flavors

Once all of the prerequisites have been installed, you need to create a `flavorizer.config.json` file to define your flavors. Each flavor represents a variant of your app with its own configuration.

### Configuration Structure

The configuration file consists of:

1. **app**: Global settings for all flavors

   - **android**: Android-specific global settings
   - **ios**: iOS-specific global settings

2. **flavors**: Array of flavor configurations

   - Each flavor needs at minimum:
     - `flavorName`: Identifier for the flavor (used in build commands)
     - `appName`: Display name of the app
     - `defaultIcon`: Default icon image path
     - Platform-specific configurations (android, ios)

3. **instructions**: List of processors to run when applying flavors

### Example

Create a new file named `flavorizer.config.json` and define the name of the
flavors, in our example **apple** and **banana**. For each flavor you have
to specify the **app name**, the **applicationId** and the **bundleId**.

or you can use the command for initialize the project:

```shell
flavorizer init
```

when you already created the configuration file you can use:

```shell
flavorizer add
```

to create new flavors, below you can see an example configuration.

```json
{
  "app": {
    "android": {
      "flavorDimensions": "dimensions-app"
    },
    "ios": {
      "buildSettings": {
        "IPHONEOS_DEPLOYMENT_TARGET": "15.6"
      }
    }
  },
  "flavors": [
    {
      "flavorName": "apple",
      "appName": "Apple App",
      "defaultIcon": "assets/icon-apple.png",
      "android": {
        "applicationId": "com.example.apple",
        "versionString": "2.2.0",
        "buildNumber": "020200",
        "adaptiveIcon": {
          "background": "assets/bg-apple.png",
          "foreground": "assets/fg-apple.png",
          "foregroundScale": "0.55"
        },
        "splash": {
          "image": "assets/fg-apple.png",
          "imageScale": "0.8",
          "resizeMode": "cover",
          "backgroundColor": "#C35955"
        }
      },
      "ios": {
        "bundleId": "com.example.apple",
        "versionString": "2.2.0",
        "buildNumber": "020200",
        "launchScreen": {
          "backgroundColor": "#C35955",
          "image": "assets/fg-apple.png"
        }
      }
    },
    {
      "flavorName": "banana",
      "appName": "Banana App",
      "defaultIcon": "assets/icon-banana.png",
      "android": {
        "applicationId": "com.example.banana",
        "versionString": "1.0.0",
        "buildNumber": "100000",
        "adaptiveIcon": {
          "background": "assets/bg-banana.png",
          "foreground": "assets/fg-banana.png",
          "foregroundScale": "0.6"
        },
        "splash": {
          "image": "assets/fg-banana.png",
          "imageScale": "0.8",
          "resizeMode": "cover",
          "backgroundColor": "#E4C65C"
        },
        "resValues": {
          "variableOne": {
            "type": "string",
            "value": "test variable one"
          },
          "variableTwo": {
            "type": "string",
            "value": "test variable two"
          }
        },
        "buildConfigFields": {
          "fieldOne": {
            "type": "String",
            "value": "test field one"
          },
          "fieldTwo": {
            "type": "char",
            "value": "y"
          },
          "fieldThree": {
            "type": "double",
            "value": "20.0"
          }
        }
      },
      "ios": {
        "bundleId": "com.example.banana",
        "versionString": "1.0.0",
        "buildNumber": "100000",
        "launchScreen": {
          "backgroundColor": "#E4C65C",
          "image": "assets/fg-banana.png"
        }
      }
    }
  ],
  "instructions": [
    "android:androidManifest",
    "android:buildGradle",
    "android:icons",
    "android:splashScreen",
    "ios:entitlements",
    "ios:xcconfig",
    "ios:xcprivacyinfo",
    "ios:plist",
    "ios:icons",
    "ios:launchScreen",
    "ios:podfile",
    "ios:buildTargets"
  ]
}
```

## Usage

```shell
Usage: flavorizer [options] [command]

Expo Flavorizer CLI

Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  list                            List all flavors existing in the configuration file
  init                            Initialize the flavorizer configuration file
  add                             Add a new flavor to the configuration file
  remove [flavorName]             Remove an existing flavor from the configuration file
  apply [options]                 Apply all changes to the expo project
  help [command]                  display help for command

Apply Command Options:
  -p, --platform <platform>       Platform to apply changes to (ios, android, all) (default: "all")
  -i, --instructions <instructions>  Comma-separated list of specific processors to run
  -f, --flavor <flavor>           Apply changes only for a specific flavor
```

## Available Instructions

It is recommended that you use all the instructions and maintain the order shown in the configuration template.

| Processor               | Description                                        | Purpose                                                       |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| android:androidManifest | Modifies the AndroidManifest.xml file              | Sets app name, permissions, and activities for each flavor    |
| android:buildGradle     | Updates the build.gradle file                      | Configures flavor dimensions, applicationId, and build fields |
| android:icons           | Generates flavor-specific icons for Android        | Creates different app icons for each flavor variant           |
| android:splashScreen    | Creates flavor-specific splash screens for Android | Customizes the initial loading screen for each flavor         |
| ios:icons               | Generates flavor-specific icons for iOS            | Creates different app icons for each flavor variant           |
| ios:launchScreen        | Creates flavor-specific launch screens for iOS     | Customizes the initial loading screen for each flavor         |
| ios:podfile             | Updates the Podfile                                | Configures CocoaPods dependencies for flavor variants         |
| ios:buildTargets        | Configures build targets for iOS                   | Sets up separate build targets for each flavor                |
| ios:plist               | Generates the Info.plist file for iOS              | Configures app display name, bundle ID, and other settings    |
| ios:entitlements        | Updates the entitlements files for iOS             | Manages app capabilities (push, IAP, etc.) per flavor         |
| ios:xcconfig            | Generates flavor-specific xcconfig files for iOS   | Manages build settings for each flavor variant                |
| ios:xcprivacyinfo       | Copies privacy info files for each flavor in iOS   | Sets up privacy descriptions required for App Store           |

## Applying the flavorization

After setting up your `flavorizer.config.json`, run:

```shell
flavorizer apply
```

This command will process all the instructions defined in your configuration file and generate flavor-specific files for both Android and iOS platforms.

### Workflow Example

A typical workflow using Expo Flavorizer might look like:

1. Initialize a new Expo project
2. Run `flavorizer init` to create your configuration file
3. Customize the `flavorizer.config.json` file with your flavor details
4. Run `npx expo prebuild --clean` to ensure a clean native project state
5. Run `flavorizer apply` to generate all flavor variants
6. Build specific flavors using the generated schemes/product flavors

For example, to build a specific flavor for iOS:

```
expo run:ios --scheme YourFlavorName
```

For Android:

```
expo run:android --variant YourFlavorNameDebug
```

### Additional apply options

You can specify which platform to apply changes to:

```shell
flavorizer apply --platform ios
flavorizer apply -p android
```

You can also run specific processors:

```shell
flavorizer apply --instructions ios:icons,ios:launchScreen
flavorizer apply -i android:buildGradle,android:icons
```

You can target a specific flavor:

```shell
flavorizer apply --flavor banana
```

Or combine all options:

```shell
flavorizer apply -p ios -i icons,launchScreen -f apple
```

## Common Use Cases

### White-Label Applications

Expo Flavorizer excels at creating white-label applications where you need multiple branded versions of the same app:

- Create separate flavors for each client with their own branding assets
- Maintain a single codebase while deploying multiple branded apps to the stores
- Configure platform-specific settings for each client

### Development Environments

Use different flavors to manage your development workflow:

- **Dev**: For development with debugging tools and test server endpoints
- **Staging**: For QA testing with staging server endpoints
- **Production**: For release with production settings and optimizations

### Free vs Premium Versions

Manage free and premium versions of your app:

- Use buildConfigFields (Android) and xcconfig settings (iOS) to toggle premium features
- Maintain different app identifiers for separate store listings
- Customize UI elements based on app version

## Troubleshooting

### Common Issues

1. **Missing Ruby/Xcodeproj**: Make sure you've installed all prerequisites before running on iOS projects.

2. **Broken Build Gradle**: If you see errors in the Android build, check that you haven't removed the magic comments in the build.gradle file.

3. **Configuration Errors**: Validate your `flavorizer.config.json` structure with the examples provided.

4. **Icon Generation Failures**: Make sure your icon images match the required format and resolution.

5. **Xcode Project Errors**: If you see Xcode project errors after flavorization, try running `npx expo prebuild --clean` and then `flavorizer apply` again.

### Debugging Tips

- Use the `--platform` flag to isolate issues to a specific platform
- Try running specific instructions one at a time to identify problematic processors
- Check your project structure matches Expo's standard structure
- Verify image assets are in the correct format (PNG recommended)

Remember that flavorizer works best on projects that closely follow the standard Expo project structure.

## Side notes

I haven't found yet a good groovy parser to guarantee the idempotency of the AndroidBuildGradleProcessor.  
The only way to keep track of the autogenerated flavorDimensions is to mark up the beginning and the end of the section with magic comments.  
Please do not erase these comments otherwise you will break down the AndroidBuildGradleProcessor.

## Questions and bugs

Please feel free to submit new issues if you encounter problems while using this library.

If you need help with the use of the library or you just want to request new features, please use the [Discussions](https://github.com/reservamos/expo-flavorizer/discussions) section of the repository. Issues opened as questions will be automatically closed.
