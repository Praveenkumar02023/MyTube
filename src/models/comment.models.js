import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema({
  content: { type: String, required: true },
  video: { type: Schema.Types.ObjectId, ref: 'Video', required: false},
  tweet: { type: Schema.Types.ObjectId, ref: 'Tweet', required: false},
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment : { type: Schema.Types.ObjectId, ref: 'Comment', required: false}
}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);