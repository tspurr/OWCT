const mongoose = require('mongoose');
const config = require('./config');
const Schema = mongoose.Schema;

const tournamentSchema = new Schema ({

    _id:    {type: String, required: true, default: config.defaultTourn._id},
    name:   {type: String, default: config.defaultTourn.name},
    url:    {type: String, default: config.defaultTourn.url},

    teams: [{type: String}]

}, {timestamps: true})


const Tournament    = mongoose.model('Tournament', tournamentSchema);
module.exports      = Tournament;