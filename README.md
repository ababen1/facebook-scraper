# First steps before you can run the script
1.Download and install node.js from https://nodejs.org/ .
2.Download and install git from https://git-scm.com/downloads . 
## Create a Google Cloud project 
3.Follow the steps https://developers.google.com/workspace/guides/create-project .
4.Follow the steps in **OAuth client ID credentials section** https://developers.google.com/workspace/guides/create-credentials#desktop-app .
5.Download the credentials (credentials -> OAuth 2.0 Client IDs -> Download OAuth client) and later put it in the project folder.
6.Go to Enabled APIs & service tab -> then click on "+ ENABLE APIS AND SERVICES" and add Google Sheets API. 
## Clone project from git and install it
7.Clone project via git -
7.1 Open cmd or terminal and write: git clone https://github.com/enterTLV/facebook-scraper.git
8 Open the new folder and write "cmd" in the folder path (url) and press enter.
8.1 In cmd under the folder path write "npm i" and wait untill the install is finished.
## Add yourself to the groups
9. you need access for all the groups before you can run the script!
## Configure script
10. edit the file config.json enter your email and password for facebook

# Running the script
1. Enter the project folder and write "cmd" in the folder path (url).
2. in cmd wite "npm start" and wait untill scrape is completed.
