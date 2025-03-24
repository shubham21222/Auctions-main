import mongoose from "mongoose";

const brandsSchema = new mongoose.Schema({

    brandName: {
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


const Brands = mongoose.model("Brands", brandsSchema);
export default Brands;