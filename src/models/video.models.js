import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
  videoFile: { 
    url: { type: String, required: true }, 
    public_id: { type: String, required: true } 
  },
  thumbnail: { 
    url: { type: String, required: true }, 
    public_id: { type: String, required: true } 
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);