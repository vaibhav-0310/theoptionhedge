import {Schema,model} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
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
        type: Number,
        unique: true,
        sparse: true , // This allows multiple null values
        default: undefined
    },
    city: {
        type: String,
    },
},
{
    timestamps: true,
    versionKey: false
});

userSchema.plugin(passportLocalMongoose);

const User = model("User", userSchema);

export default User;
