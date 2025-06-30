import {Schema,model} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    Phone:{
        type:Number,
        unique: true,
        trim: true,
    },
    city: {
        type: String,
        trim: true
    },
},
{
    timestamps: true,
    versionKey: false
});
  

userSchema.plugin(passportLocalMongoose);

const User = model("User", userSchema);

export default User;
