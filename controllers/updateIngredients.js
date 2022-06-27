const fs = require('fs');
const {downloadIngredient, deleteFile, uploadIngredient} = require('./driveController');
const ExtraIngredients = require('../models/extraIngredients');
// const old = require('../ing.json');
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const update = async () => {
    // console.log('update');
     downloadIngredient('ing.json').then(async (promise) => {
        if(promise) {
            let data =  fs.readFileSync('./ing.json');
        
            let jsonData = JSON.parse(data);
            // console.log(jsonData);
            const extra = await ExtraIngredients.findOne({});
            jsonData = jsonData.concat((extra.ingredients).filter(onlyUnique));
            // jsonData = jsonData.filter(onlyUnique);
            let data2 = JSON.stringify(jsonData);
            console.log(extra.ingredients);
            fs.writeFileSync('ing.json', data2);

            await deleteFile(process.env.INGREDIENT_KEY);
            const resp = await uploadIngredient('./ing.json');
            if(resp['status'] == true) {
                extra.ingredients = [];
                await extra.save();
            }
        }
        
     });
     
    
}

module.exports = update;