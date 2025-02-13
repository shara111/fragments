# fragments
Various scripts that I created were lint, start, dev, and debug.

##Prerequisites
Node.js: Make sure you have Node.js installed. You can download it from https://nodejs.org
Npm: Make sure you have Npm installed as it usually comes with node.js

Installation
After cloning the repo, make sure to download the required dependencies:
npm install

1) Script
To start the project, you can run the following command:
npm start

2) Development Mode
For development with automatic reloading on code changes use:
npm run dev

3) The command I used to create the eslint setup is the following:
npm init @eslint/config@latest

4) The command to install the nodemon package, so that it automatically reload the server whenever the code changes:
npm install --save-dev nodemon

Also, Linting command is used to check your code for linting errors
npm run lint

5) Debugging
To run the vscode debug mode, navigate to the run and debug tab, and select the launch program configuration
press f5 to start debugging
npm run debug

5) Health check
http://localhost:8080

Alternatively, we can use curl to text it
curl http://localhost:8080




