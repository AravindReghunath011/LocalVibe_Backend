import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Denormalized user info for fast reads
  username: { type: String, required: true },
  name: { type: String, required: true },
    avatar:{type:String,default:"https://res.cloudinary.com/ddcx6tsgg/image/upload/v1748279531/default_xlefjr.png"},
  content: { type: String, required: true, maxlength: 280 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
