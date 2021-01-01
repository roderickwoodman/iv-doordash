# DoorDash Frontend Interview Project

THIS is **DoorDash Chat ("DD-Chat")**. It's the app that lets you communicate in real-time with anyone else who has an Internet connection. Of course, there is no such thing as having too many chat apps. So here is how to get started...

## Connecting to a Locally Running App

### System and browser requirements
* [Node](https://nodejs.org/en/download/]) 7.0.0 or later.
* Chrome, Firefox, or Safari browsers at their current versions.

### App installation and startup

First, from [this GitHub repo](https://github.com/roderickwoodman/iv-doordash) click on the *"Code" button* and then select the *"Download ZIP" menu option* and save the file to your local drive.

Now, in the first terminal window, type:

	> cd <the download folder that contains the ZIP file>
	> unzip iv-doordash-main.zip
	> cd iv-doordash-main
	> npm install
	> npm run api-server

And in a second terminal window, type:

	> cd <the extracted iv-doordash-main folder> 
	> npm run client

### Viewing in the browser
Your second terminal window should now be showing the output:
><pre>Compiled successfully!</pre><pre>You can now view iv-doordash-FE in the browser.</pre><pre>Local:            http://localhost:8844</pre>
Finally, point your browser to  http://localhost:8844 to see the **DD-Chat** app.

## OR, Connecting to the App LIVE on the Internet!
 
### Browser requirements
* Chrome, Firefox, or Safari browsers at their current versions.

### Viewing in the browser
Simply point your browser to  https://iv-doordash.wl.r.appspot.com/ to see the **DD-Chat** app.

## Under The Hood

### Technology decisions
**ReactJS** was the chosen JavaScript library for its ease of use and simple state and lifecycle management via Hooks. **Create-react-app** was used in order to quickly bootstrap the project. **Bootstrap** was added to lean on some generally accepted element padding opinions. **Google Cloud Platform** was chosen to be the Node-based deployment platform primarily as a learning experience for the developer.

### Macro code structure
A modern, **component-based architecture** is essential for maintainability and extensibility. And because this application had a one-directional user flow in addition to a limited data flow between only 2 views, it made sense to have the two views be more presentational, child components ("Login" and "Chatroom") under a more container-like, parent component ("App"). With this definition, not much data would need to be shared between these **3 primary components**.

### Micro code structure
### Usability
### Testing

## Extras
### Features