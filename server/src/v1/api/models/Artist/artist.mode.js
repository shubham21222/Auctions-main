import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({

    artistName: {
        type: String,
        required: false,
        default: ""
    },

    summary:{
        type: String,
        required: false,
        default: ""
    },

    Biography: {
        type: String,
        required: false,
        default: ""
    },

   images:[{
       type: String,
        required: false,
        default: ""
   }],

   createdBy:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required:false,
       default: null
   },


},{
    timestamps: true
})


const Artist = mongoose.model("Artist", artistSchema);
export default Artist;