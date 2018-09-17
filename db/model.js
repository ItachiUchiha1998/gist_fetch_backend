const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User_Details_Schema = new Schema({
	
	username: String,
	email: String,
	password: String

})

var AuthToken_Schema = new Schema({
  
  token:String,
  username: String,
  id: String

})

var Gists_Schema = new Schema({
	uid: String,
	gist: String,
	owner: String,
	desc: String,
	filename: String,
	language: String
})

var User_Details = mongoose.model('user_details',User_Details_Schema);
var AuthToken = mongoose.model('auth_token',AuthToken_Schema);
var Gists = mongoose.model('gists',Gists_Schema);

module.exports =  {
	User_Details: User_Details,
	AuthToken: AuthToken,
	Gists: Gists
};