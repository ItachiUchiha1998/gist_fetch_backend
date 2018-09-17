# Gist Fetch Api

## Setup

  Nodejs and MongoDB should be installed.
  
  after cloning the repo
  
  enter => ` npm install && npm install bcrypt`<br>
  then to start the application => ` npm start `
  

## Api Endpoints: 

1) Register: Registers the user and returns unique jsonwebtoken and uid to user <br>
  `/register`<br> Type: `POST` <br> Send Following in Body: <br>
       username: String, // should be unique<br>
       password: String,<br>
       first_name: String,<br>
       last_name: String<br>

2) Login: Logs in the user and returns unique jsonwebtoken <br> `/login` <br> Type: `POST` <br> Send Following in Body: <br>
    username: String,<br>
    password: String

3) Logout: Destroys users token and logs out <br> `/logout`<br>Type: `POST` <br> Send Following in Body: <br>
     token: String

4) Fetch Gists :Fetch all gists <br> `/getGists`<br>
    Type: `POST` <br> 
5) Star: Star a gist <br> `/star`  <br> Type: `POST` <br>
    Send Following in Body: <br>
    uid: ID of user <br>
    gist_url: URL of gist starred <br>
    <br>
6) My Bucket: Returns starred repo urls <br> Type: `POST` <br> `/mybucket` <br>
    Send Following in Body: <br>
    uid: Unique id of user
