const User = require("../models/users.js");
const { totp } = require("otplib");
const { v4: uuidv4 } = require("uuid");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

totp.options = {
  digits: 6,
  step: 1000,
};
const opts = totp.options;
const secret = process.env.TOTP_SECRET;

const register = async (req, res) => {
  let user = req.body;
  const uuid = uuidv4() + "_" + req.body.username;
  user.uuid = uuid;
  try {
    const userToRegister = uuid;
    myCache.set(userToRegister, user);
    res.redirect("user/mail/" + uuid);
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "User can't be created",
      errors: [],
      data: {},
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    // res.status(200).send({ user, token });
    res.status(200).json({
        status: true,
        message: "You are logged in !",
        errors:[],
        data: {
            user:user,
            token:token
        }
    })
  } catch (error) {
    // res.status(400).send(error);
    res.status(400).json({
        status: false,
        message: "Unable to access your account",
        errors:error,
        data: {}
    })
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    // res.send();
    res.status(200).json({
        status: true,
        message: "You have been logout",
        errors:[],
        data: {}
    })
  } catch (error) {
    // res.status(500).send();
    res.status(500).json({
        status: false,
        message: "Unable to logout",
        errors:error,
        data: {}
    })
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    // res.send();
    res.status(200).json({
        status: true,
        message: "You have been logout from all of your accounts !!!",
        errors:[],
        data: {}
    })
  } catch (error) {
    // res.status(500).send();
    res.status(500).json({
        status: false,
        message: "Unable to logout from all of your accounts ",
        errors:error,
        data: {}
    })
  }
};

const findAll = async (req, res) => {
//   res.send(req.user);

  try{
      const user=await User.find({})
    //   res.status(201).send(user)
      res.status(201).json({
        status: true,
        message: "This is your profile",
        errors:[],
        data: {
            users:user
        }
       })
    }catch(error){
    //   res.status(400).send(error)
    res.status(400).json({
        status: false,
        message: "Unable to read all the users",
        errors:error,
        data: {}
    })
  }

//   User.find({}).then((users)=>{
//       res.status(200).send(users)
//   }).catch((error)=>{
//       res.status(500).send(error)
//   })
};

const findOne = async (req, res) => {
  const uuid = req.params.id;

  try {
    const user = await User.findOne({uuid: uuid});
    if (!user) {
    //   return res.status(404).send();
      return res.status(404).json({
        status: false,
        message: "No User has been found",
        errors:error,
        data: {}
       })
    }
    // res.status(200).send(user);
    res.status(200).json({
        status: true,
        message: "This is your profile",
        errors:[],
        data: {
            users:user
        }
       })
  } catch (error) {
    // res.status(500).send(error);
    res.status(500).json({
        status: false,
        message: "Unable to read any User !!!",
        errors:error,
        data: {}
    })
  }

  // User.findById(_id).then((user)=>{
  //     if(!user){
  //         return res.status(404).send()
  //     }
  //     res.status(200).send(user)
  // }).catch((error)=>{
  //     res.status(500).send(error)
  // })
};

const update = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name","number","website","bio"];
  const isValidOpration = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOpration) {
    return res.status(400).send("Invalid updates!");
  }

  try {
    const user = await User.findById(req.params.id);

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    if (!user) {
    //   res.status(404).send();
      res.status(404).json({
        status: false,
        message: "No User found !!!",
        errors:error,
        data: {}
    })
    }
    // res.status(200).send(user);
    res.status(200).json({
        status: true,
        message: "Your profile has been updated",
        errors:[],
        data: {
            user:user
        }
    })
  } catch (error) {
    // res.status(500).send(error);
    res.status(500).json({
        status: false,
        message: "Unable to update your account profile !!!",
        errors:error,
        data: {}
    })
  }
};

const remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      // res.status(404).send('No user found')
      res.status(404).json({
        status: false,
        message: "No User Found",
        errors: error,
        data: {},
      });
    }
    // res.status(200).send('Deleted!')
    res.status(200).json({
      status: true,
      message: "User has been deleted",
      errors: [],
      data: {},
    });
  } catch (error) {
    // res.status(500).send(error)
    res.status(500).json({
      status: false,
      message: "Unable to delete User",
      errors: error,
      data: {},
    });
  }
};

//Twilio otp

const mail = async (req, res) => {
  req.user = myCache.get(req.params.uuid);
  if (req.user) {
    const toptToken = totp.generate(secret);
    const toUser = req.user.email;
    const uuid = req.user.uuid;

    const msg = {
      to: toUser,
      from: "soham2112@gmail.com",
      subject: "Tassie OTP",
      text: messageGenerate(req.user.name, toptToken),
    };

    await sgMail.send(msg, (err, info) => {
      if (err) {
        console.log("email not sent");
        res.status(400).json({
          status: false,
          message: "Mail not sent",
          errors: err,
          data: {},
        });
      } else {
        // res.send(uuid);
        res.status(200).json({
          status: true,
          message: "OTP has been sent to your mail",
          errors: [],
          data: {
            uuid: uuid,
            time: totp.timeRemaining(),
          },
        });
        console.log("email sent to : " + toUser);
      }
    });
  }
};

const twoStepVerification = async (req, res) => {
  req.user = myCache.get(req.params.uuid);
  const isValid = totp.check(req.body.totp, secret);
  if (req.user && isValid == true) {
    try {
      const user = req.user;
      const newUser = new User(user);
      const token = await newUser.generateAuthToken();
      await newUser.save();
      //    res.status(201).send({newUser,token})
      res.status(201).json({
        status: true,
        message: "User has been saved",
        errors: [],
        data: {
          uuid: user.uuid,
          token: token,
        },
      });
      myCache.take(user.uuid);
    } catch (error) {
      //    res.status(400).send(error)
      res.status(400).json({
        status: false,
        message: "Incorrect OTP",
        errors: error,
        data: {},
      });
    }
  } else {
    res.send("unathenticated");
    res.status(400).json({
      status: false,
      message: "Unauthenticated",
      errors: error,
      data: {},
    });
  }
};

const messageGenerate = (name, otp) => {
  const message = `${
    "Hello " +
    name +
    ", \nYour One Time Password (OTP) for Tassie App authentication is : " +
    otp +
    "\nThis OTP is valid for next " +
    totp.timeRemaining() +
    " seconds.\n\nThis OTP is based on time for security purposes.\nKindly resend request if expiration time is very less."
  }`;
  return message;
};

module.exports = {
  remove,
  update,
  findAll,
  findOne,
  register,
  update,
  login,
  logout,
  logoutAll,
  mail,
  twoStepVerification,
};
