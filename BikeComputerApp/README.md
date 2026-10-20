# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install expo
   ```

2. Start the app

   ```bash
   npx expo run:ios
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Deploying to IPhone

1. In the root of the expo app enter: `open ios/BikeComputerApp.xcworkspace`. Which will open up the project in xcode.
1. On the left sidebar of Xcode select BikeComputerApp then select BikeComputerApp under TARGETS in the next sidebar.
1. From the drop down menu select Signing & Capabilites.
1. Make sure `Automatically manage siging` is turned on. Under the team section, select your Personal Team which is associated with your Apple account. If you don't have an account locate Apple Accounts in the Xcode settings to add your personal account.
1. Now switch to your Iphone and go to settings. From there you will want to go to privacy and security. Near the bottom turn on Developer Mode. This will require you to restart your Iphone.
1. Lastly, start up the app using `npx expo run:ios --device`. When prompted select your device.

## Debugging

If you recieve this error: Script '[CP-User] Build ExpoModulesJSI xcframework' failed
   └─Pods/ExpoModulesJSI
1 | #import "/Users/anthonymonteagudo/Documents/SeniorDesign/Bike-Computer-App/BikeComputerApp/ios/Pods/Headers/Public/React-jsi/jsi/jsi.h"
|         `- note: in file included from <module-includes>:1:
2 | #import "/Users/anthonymonteagudo/Documents/SeniorDesign/Bike-Computer-App/BikeComputerApp/ios/Pods/Headers/Public/React-jsi/jsi/instrumentation.h"
3 |
5 warnings generated.
2265 |
2266 | #include <jsi/jsi-inl.h>
2267 |
| `- warning: umbrella header for module 'jsi' does not include header 'jsilib.h'
/Users/anthonymonteagudo/Documents/SeniorDesign/Bike-Computer-App/BikeComputerApp/node_modules/expo-modules-jsi/apple/.DerivedData/Build/Products/Release-iphonesimulator/PackageFrameworks/ExpoModulesJSI.framework: resource fork, Finder information, or similar detritus not allowed


❌  Command PhaseScriptExecution failed with a nonzero exit code
** BUILD FAILED **


› 2 error(s), and 0 warning(s)

CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.

Run this command: xattr -dr com.apple.FinderInfo node_modules/expo-modules-jsi

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
