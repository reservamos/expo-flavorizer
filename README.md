# React Native Flavorizer

A utility to easily create flavors in your Expo/RN applications

## Getting Started

Let's start by setting up our environment in order to run react-native-flavorizer

### Prerequisites

Side note: this tool works better on a new and clean react native project.
Since some processors reference some existing files and a specific base
structure, it could be possible that running react-native-flavorizer over an
existing project could throw errors.

Before running react-native-flavorizer, you must install the following
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
yarn global add react-native-flavorizer
```

or using `NPM`

```shell
npm -g install react-native-flavorizer
```

## Create your flavors

Once all of the prerequisites have been installed and you have added
a `flavorizer.config.json` file and define the
flavors.

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
        "IPHONEOS_DEPLOYMENT_TARGET": "13.0",
        "MINIMUM_IPHONEOS_VERSION": "13.0"
      }
    }
  },
  "flavors": [
    {
      "flavorName": "apple",
      "appName": "Apple App",
      "defaultIcon": "testResources/assets/icon-apple.png",
      "android": {
        "applicationId": "com.example.apple",
        "adaptiveIcon": {
          "background": "testResources/assets/bg-apple.png",
          "foreground": "testResources/assets/fg-apple.png",
          "foregroundScale": "0.6"
        },
        "splash": {
          "image": "testResources/assets/fg-apple.png",
          "imageScale": "0.6",
          "imageWidth": "300",
          "imageHeight": "300",
          "resizeMode": "cover",
          "backgroundColor": "#C35955"
        }
      },
      "ios": {
        "bundleId": "com.example.apple",
        "launchScreen": {
          "backgroundColor": "#C35955",
          "image": "testResources/assets/fg-apple.png"
        }
      }
    },
    {
      "flavorName": "banana",
      "appName": "Banana App",
      "defaultIcon": "testResources/assets/icon-banana.png",
      "android": {
        "applicationId": "com.example.banana",
        "adaptiveIcon": {
          "background": "testResources/assets/bg-banana.png",
          "foreground": "testResources/assets/fg-banana.png",
          "foregroundScale": "0.6"
        },
        "splash": {
          "image": "testResources/assets/fg-banana.png",
          "imageScale": "0.6",
          "imageWidth": "300",
          "imageHeight": "300",
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
        "launchScreen": {
          "backgroundColor": "#E4C65C",
          "image": "testResources/assets/fg-banana.png"
        }
      }
    }
  ],
  "instructions": [
    "android:androidManifest",
    "android:buildGradle",
    "android:icons",
    "android:splashScreen",
    "ios:xcconfig",
    "ios:buildTargets",
    "ios:schema",
    "ios:icons",
    "ios:plist",
    "ios:launchScreen"
  ]
}
```
