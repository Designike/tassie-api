const User = require("../models/users.js");
const Recs = require("../models/recipe.js");
const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");


const loadRecs = (req, res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {recs: res.paginatedResults},
      });
}


module.exports = {
    loadRecs,
};