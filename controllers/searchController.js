const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");
const Tag = require("../models/tag.js");
const User = require("../models/users.js");

const guess = async (req,res) => {
  try {
    
  
    // var limit = 20;
    // var start = req.body.start;
    // var veg = req.body.veg;
    // var flavour = req.body.flavour;
    var ingredients = req.body.ingredients;
    // var time = req.body.maxTime;
    // var course = req.body.course;
    var meal = req.body.meal;
    let options = {

    };
    // console.log(req.body);
    let opts = Object.keys(req.body);
    // console.log(opts);
    if (opts.includes('ingredients')) {
    opts = opts.filter(element => element != 'ingredients');
    }
    if (opts.includes('maxTime')) {
      opts = opts.filter(element => element != 'maxTime');
      options['time'] = {
        $lte: req.body.maxTime,
      };
      // console.log(options);
    }
    // console.log(opts);
    // console.log('1A');
    if (opts.includes('meal')) {
      // console.log('1B');
      opts = opts.filter(element => element != 'meal');
      // console.log(meal);
      if(meal[0] == true) {
        options['isBreakfast'] = true;
      }
      // console.log('3C');
      if(meal[1] == true) {
        options['isLunch'] = true;
      }
      // console.log('4D');
      if(meal[2] == true) {
        options['isDinner'] = true;
      }
      // console.log('5E');
      if(meal[3] == true) {
        options['isCraving'] = true;
      }
    }
    // console.log('6F');
    // console.log(opts);
    opts.forEach((update) => (options[update] = req.body[update]));
    // console.log(options);
    var ans;
    // console.log(req.body);
    // var tag = [];
    const recipe = await Recipe.find(options, '-_id uuid recipeImageID name userUuid username profilePic');
    // const recipe = await Recipe.find({veg:veg, course:course, flavour:flavour, time:{$lte:time}, '$or':[{isBreakfast:meal[0]}, {isLunch:meal[1]}, {isDinner:meal[2]}, {isCraving:meal[3]}]}, '-_id uuid recipeImageID name userUuid username profilePic');

    // console.log(recipe);
    if(recipe.length > 0){
        // console.log('inside');
    if(ingredients.length != 0){
      ans = await sortQuery(recipe,ingredients);
      // ans.expires = Date.now();
    }else{
      ans = recipe;
      // ans.expires = Date.now();
    }
    // console.log(ans);
    var expires = new Date(); 
    expires.setSeconds(expires.getSeconds() + (60*45));
    const newSuggest = new Suggestion({suggest: ans,expires:expires});
    await newSuggest.save((err, doc)=>{
      // console.log(doc._id.toString());
      res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {id: doc._id.toString()},
      });
    });
    // console.log(newSuggest);
    
    }else{
        res.status(201).json({
            status: true,
            message: "",
            errors: [],
            data: {},
          });
    }
  } catch (error) {
    console.log(error);
    res.status(201).json({
      status: false,
      message: "Server error",
      errors: [],
      data: {},
    });
  }
}

// function sortQuery(db,query){
//     let temp=[];
//     let mark={};
//     query.forEach(element => {
//         mark[element] = true;
//     });
  
//     db.forEach(element => {
//      let ct=0;
//      element.forEach(e => {
//          if(mark[e]){
//              ct+=1;
//          }
//      });
//      temp.push([ct,element]);   
//     });
  
//     temp = temp.sort();
//     let ans = [];
//     temp.forEach(element => {
//       if(element[0]!=0){
//         ans.push(element[1]);
//       }
//     })
//     return ans.reverse();
//   }


const showResults = async (req,res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: res.paginatedResults,
      });
}

  
async function sortQuery(db,query){
  let temp=[];
  let mark={};
  query.forEach(element => {
      mark[element] = true;
  });
  
  db.forEach(element => {
   let ct=0;
  
   if(element.ingredients){
   element.ingredients.forEach(e => {
       if(mark[e]){
           ct+=1;
       }
   });
  }
   if(ct>0){
      temp.push(element);   
   }
  });

  return temp.sort(function(a,b){return b[0]-a[0]});
}

const explore = async (req,res) => {
    // console.log(res.paginatedResults);
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: res.paginatedResults,
      });
}

const searchAll = async (req,res) => {
  // console.log(res.paginatedResults);
  res.status(201).json({
      status: true,
      message: "",
      errors: [],
      data: res.paginatedResults,
    });
}

const searchRecipe = async (req,res) => {
    let phrase = req.params.word;
    // const tags = await Tag.find({"name": {$regex: phrase},"isUser":false}).limit(3);
    // const persons = await Tag.find({"name": {$regex: phrase, $options: "i"},"isUser":true}).limit(3);
    try{
        const recs = await Recipe.find({"name": {$regex: phrase, $options:'i'}},'-_id name uuid url').limit(10);
        res.status(201).json({
            status: true,
            message: "Here you go!",
            errors: [],
            data: {recipes:recs},
      });
    }catch(error){
        res.status(201).json({
            status: true,
            message: "server error",
            errors: error,
            data: {},
      });
    }
}

const searchUser = async (req,res) => {
    // let phrase = req.params.word;
    // const user = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(10);
    // console.log(user);
    // res.status(201).json({
    //     status: true,
    //     message: "",
    //     errors: [],
    //     data: {users:user},
    //   });

      let phrase = req.params.word;
      // const tags = await Tag.find({"name": {$regex: phrase},"isUser":false}).limit(3);
      // const persons = await Tag.find({"name": {$regex: phrase, $options: "i"},"isUser":true}).limit(3);
      try{
        const user = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(10);
          res.status(201).json({
              status: true,
              message: "Here you go!",
              errors: [],
              data: {users:user},
        });
      }catch(error){
          res.status(201).json({
              status: true,
              message: "server error",
              errors: error,
              data: {},
        });
      }
}

const searchTag = async (req,res) => {
    let phrase = req.params.word;
      // const tags = await Tag.find({"name": {$regex: phrase},"isUser":false}).limit(3);
      // const persons = await Tag.find({"name": {$regex: phrase, $options: "i"},"isUser":true}).limit(3);
      try{
        const tags = await Tag.find({"name": {$regex:'^'+phrase, $options:'i'}},'-_id name').limit(10);
          res.status(201).json({
              status: true,
              message: "Here you go!",
              errors: [],
              data: {tags:tags},
        });
      }catch(error){
          res.status(201).json({
              status: true,
              message: "server error",
              errors: error,
              data: {},
        });
      }
}

module.exports = {
    guess,
    showResults,
    explore,
    searchRecipe,
    searchUser,
    searchTag,
    searchAll
}


