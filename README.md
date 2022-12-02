# Scootly.io

## Fully working features

- Sign in with Google
- User Management with Firebase Auth
- Email/Password Registration
- Persistent Login Credentials (a.k.a Remember password)
- Logout Functionality
- Messaging between users
- 

## Installation

* Unarchive the downloaded .zip
* Go to Firebase.com and create your own account and a project
* In Firebase Console, create your own Android App and iOS App
* Download the google-services.json file from your Firebase Console, and place it in the android folder of the starter kit (override the existing one)
* Download the GoogleService-Info.json file from your Firebase Console, and place it in the ios folder of the starter kit (override the existing one)
* Open a Terminal, locate the starter kit folder (where the package.json file is) and run:

```
npm install && react-native run-android

```

## App Designs


## Google signin

- when signing in with google on android and you get "developer_error google sign in".
- take the following steps:

      	* in the command line, enter:
      		keytool -exportcert -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore

      	*  when prompted for password, enter:
      		android

      	* you should successfully generate some keys.
      	* copy the "SHA1:" key
      	* visit firestore console in your browser
      	* under settings>>Project settings select "RN Starter Kit Android"
      	* click "add fingerprint"
      	* paste the copied "SHA1:" key

      	* then rebuild app

# Credit:
Started with template from instamobile: https://github.com/instamobile/react-native-starter-kit