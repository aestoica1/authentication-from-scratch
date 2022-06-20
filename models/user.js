const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
});

// statics is where we can define mulitple methods that will be added
// to the User Class, to the Model and not to particulara instances of User
userSchema.statics.findAndValidate = async function (username, password) {
    // this refers to the particular Model, User
    // find the user with the username
   const foundUser = await this.findOne({username: username});
    // compare the text password with the hashed v from db
   const isValid = await bcrypt.compare(password, foundUser.password);
    // if isValid is true, return foundUser otherwise return false; we use the tunary operator
   return isValid? foundUser: false;
}

// before a user is saved
userSchema.pre('save', async function (next) {
    // we want to rehash the passwordd only if it was modified not every time we save a the user
    // if it wasn't modified move to save and ignore the hashing
    if(!this.isModified('password')) return next();
    // this refers to the particular instance of the user
    // this refers to the particular user that it's being saved
    this.password = await bcrypt.hash(this.password, 12);
    // next should call save
    next();
});

module.exports = mongoose.model('User', userSchema);