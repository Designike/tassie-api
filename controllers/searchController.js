const Recipe = require("../models/recipe.js");

const guess = async (req,res) => {
    var veg = req.body.veg;
    var flavour = reg.body.flavour;
    var course = req.body.course;
    var time = req.body.estTime;
    var ingredients = req.body.ingredients;
    var tag = [];
    const recipe = await Recipe.find({veg:veg, course:course, flavour:flavour, time:time},'-_id ingredients');
    var ans = sortQuery(recipe,query);
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

  
function sortQuery(db,query){
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
      temp.push([ct,element]);   
   }
  });

  return temp.sort(function(a,b){return b[0]-a[0]});
}


module.exports = {
    guess,
}


