# Book scanning app

## How to setup

1. Install dependencies

   ```bash
   npm install or yarn
   ```

2. Start the app

   ```bash
    npx expo start
   ```

Go to Google cloud console and get an api key

[Google cloud console](https://console.cloud.google.com/apis/dashboard)

- When you login to Google cloud console, create a new project.
- Inside the project, enable Cloud Vision API and Books API.
- Then click on Create Credentials to create a new api key (Ensure that you select Cloud Vision API and Books API when Selected APIs for the new api key).
- Copy the api key, create a .env file in the root of this project.
- Add the api key to the .env file with this name EXPO_PUBLIC_GOOGLE_API_KEY="api-key-here".
- Also add the api key to the eas.json file EXPO_PUBLIC_GOOGLE_API_KEY="api-key-here".
- Run yarn android in the terminal to start the app


## Explanations

When you're ready, run:
- The app asks for user permission before capturing image with camera.
- I converted the image to a base64 string and passed it to Google Vison API.
- Google Vision API handles the OCR technology which detects the text from the image.
- When it returns a successful response, I pass the text as a search query to the Books API.
- The Books API then returns the books that were found.
- I populate the books that were found on the UI inside a Scrollview container or show a message that no book was found.
- One other architectural decision that I will make is to fetch more books based on the search query when the user scrolls to the bottom of the list i.e pagination/infinite scrolling.


## To build the apk file
Use ```eas build -p android --profile preview --local``` to build the apk file.