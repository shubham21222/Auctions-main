import mongoose from "mongoose";
import { Schema } from "mongoose";

const SellerSchema = new Schema({
    
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
    },

    General:{

        countryOrigin:{
            type: String,
            required: false
        },

        Artist:{
            type: String,
            required: false
        },

        object:{
            type: String,
            required: false
        },

        material:{
            type: String,
            required: false
        },

        tortoiseshell:{
            type: String,
            required: false
        },

        periodOfwork:{
            type: String,
            required: false
        }
    },

    Measurement:{

        framed:{
            type:String,
        },

        height:{
            type: String,
            required: false
        },

        width:{
            type: String,
            required: false
        },

        depth:{
            type: String,
            required: false
        },

        weight:{
            type: String,
            required: false
        }
    },

    Condition:{

        Signatures:{
            type: String,
            required: false
        },

        AreaofDamage:{
            type: String,
            required: false
        },

        restoration:{
            type: String,
            required: false
        },
    },

    Provenance:{

        historyofownership:{
            type: String,
            required: false
        },

        Appraisals :{
            type: String,
            required: false
        },
    },

    price:{

        paidPrice:{
            type: String,
            required: false
        },

        currency:{
            type: String,
            required: false
        },

        paidYear:{
            type: String,
            required: false
        },
        Notes:{
            type: String,
            required: false
        }
    },

    Documents:{

        frontImage:{
            type: String,
            required: false
        },

        backImage:{
            type: String,
            required: false
        },

        detailImage:{
            type:String,
            required:false
        },

        MakermarkImg:{
            type:String,
            required:false
        },

        DamageImage:{
            type:String,
            required:false
        },

        DocumentationImg:{
            type:String,
            required:false
        }
    },

    logistic_info:{
        firstName:{
            type: String,
            required: false
        },

        lastName:{
            type: String,
            required: false
        },

        email:{
            type: String,
            required: false
        },

        state:{
            type: String,
            required: false
        },

        city:{
            type: String,
            required: false
        },
        country:{
            type: String,
            required: false
        },

        phone:{
            type: String,
            required: false
        },

        samelocation:{
            type: String,
            required: false
        },

        handlingshipping:{
            type: String,
            required: false
        }
    },

    // Approved by Admin //

    Approved:{
        type: Boolean,
        enum: [true, false],
        default: false
    },

    ApprovedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },


},{
    timestamps:true
})


const Seller = mongoose.model('Seller', SellerSchema);
export default Seller;