import mongoose, {Schema} from "mongoose";
import bycrpt from "bcrypt"
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";

dotenv.config(
    {
        path:"./src/.env"
    }
)

const userSchema = new Schema({
    watchHistory: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    avatar: { url: String, public_id: String },
    coverImage: { url: String ,public_id: String},
    password: { type: String, required: true },
    refreshToken: { type: String }
}, { timestamps: true });

//middlewares

//encrpyt the password
userSchema.pre('save',async function(next){

  if(!this.isModified('password')){
    return next();
  }
  try {
    const salt = await bycrpt.genSalt(10);
    this.password = await bycrpt.hash(this.password,salt)
    next();
    
  } catch (error) {
    next()
  }
});

//compare user entered password and encrypted password

userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
  return bycrpt.compare(enteredPassword,this.password);
}

//access token for user
userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
  
    id: this._id,
    username : this.username,
    email : this.email
    
  }, process.env.USER_ACCESS_TOKEN,
   { 
    expiresIn: '1h' 
   }
  );
};

//refresh token for user

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
  
    id: this._id,
    username : this.username,
    email : this.email
    
  }, process.env.USER_REFRESH_TOKEN,
   { 
    expiresIn: '1d' 
   }
  );
}

export const User = mongoose.model("User",userSchema);