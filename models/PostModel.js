import mongoose from 'mongoose';

const POST_TYPES = [
  'Recommendation',
  'Needed Help',
  'Local Update',
  'Event'
];

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Denormalized user info for fast reads
  username: { type: String, required: true },
  name: { type: String, required: true },
  
  type: {
    type: String,
    enum: POST_TYPES,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function (value) {
          return value.length === 2;
        },
        message: 'Coordinates must be an array of [longitude, latitude]'
      }
    }
  },
  content: {
    type: String,
    maxlength: 280
  },
  media: { 
    type: [String],   // Changed to array of strings (URLs or file paths)
    default: []
  },
  avatar:{type:String,default:"https://res.cloudinary.com/ddcx6tsgg/image/upload/v1748279531/default_xlefjr.png"},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Enable geospatial queries
postSchema.index({ location: '2dsphere' });

const Post = mongoose.model('Post', postSchema);

export default Post;
