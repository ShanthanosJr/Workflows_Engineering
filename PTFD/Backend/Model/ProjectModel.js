const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    pname: {
        type: String,
        required: true,
    },
    pcode: {
        type: String,
        required: true,
    },
    pownerid: {
        type: String,
        required: true,
    },
    pownername: {
        type: String,
        required: true,
    },

    pdescription: {
        type: String,
        required: true,
    },
    pcreatedat: {
        type: Date,
        default: Date.now
    },
    pupdatedat: {
        type: Date,
        default: Date.now
    },
    pbudget: {
        type: Number,
        required: true,
    },
    pstatus: {
        type: String,
        required: true,
    },
    penddate: {
        type: Date,
        required: true,
    },

    });

    module.exports = mongoose.model(
        "ProjectModel", // filename
         ProjectSchema); // function name