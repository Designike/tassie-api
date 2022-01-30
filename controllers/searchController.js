const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");

const guess = async (req,res) => {
    // var limit = 20;
    // var start = req.body.start;
    var veg = req.body.veg;
    var flavour = req.body.flavour;
    var ingredients = req.body.ingredients;
    var time = req.body.maxTime;
    var course = req.body.course;
    // console.log(req.body);
    // var tag = [];
    const recipe = await Recipe.find({veg:veg, course:course, flavour:flavour, time:{$lte:time}}, '-_id uuid url name ingredients');
    // console.log(recipe);
    if(recipe.length > 0){
        // console.log('inside');
    var ans = await sortQuery(recipe,ingredients);
    // console.log(ans);
    const newSuggest = new Suggestion({suggest: ans});
    await newSuggest.save();
    // console.log(newSuggest);
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {recs: ans},
      });
    }else{
        res.status(201).json({
            status: true,
            message: "",
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
        data: {posts: res.paginatedResults},
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


module.exports = {
    guess,
    showResults
}


