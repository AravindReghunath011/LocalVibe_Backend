import axios from "axios";
import Comment from "../models/CommentModel.js";
import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose";


const POST_TYPES = [
  'Recommendation',
  'Needed Help',
  'Local Update',
  'Event'
];

export const create_post = async (req, res) => {
  try {
    console.log(req.body,'body')
    let { type, location, content, media } = req.body;
    const userId = req.user.id; // from auth middleware
    console.log(userId,'id')
    if(location){
        location ={
    type: 'Point',
    coordinates: [location.lng, location.lat] // longitude first!
  }; 
    }

    
    // Validate required fields
    if (!type || !userId) {
      return res.status(400).json({ message: 'Type and userId are required' });
    }

    // Validate post type
    if (!POST_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid post type. Must be one of: ${POST_TYPES.join(', ')}` });
    }

    // Validate content length
    if (content && content.length > 280) {
      return res.status(400).json({ message: 'Content must be 280 characters or less' });
    }

    // Fetch user info to denormalize
    const user = await User.findById(userId).select('name username avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(location,'location')
    // Create the post with denormalized user info
    const newPost = new Post({
  userId,
  username: user.username,
  name: user.name,
  avatar:user.avatar,
  type,
  content,
  media: media || [],
  comments: [],
  likes: [],
  dislikes: [],
  ...(location && { location }), // Only adds location if it's not null
});


    await newPost.save();

    return res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server error while creating post' });
  }
};




export const get_posts = async (req, res) => {
  try {
    const {name, type, longitude, latitude, radius } = req.body || {};

    const query = {};

    // Filter by post type if provided
    if (type && type!='all') {
      query.type = type;
    }
    if(name){
        query.name = name
    }
    console.log(req.body,'body')

    // Build location filter if coordinates are provided
    if (longitude && latitude) {
      const maxDistance = radius ? parseInt(radius) : 50000; // default 50km in meters

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // Fetch posts matching filters, sorted by newest first
    const posts = await Post.find(query)
      .populate('userId', 'name username avatar')  // optional, populate user info
      .populate('comments')                  // populate comments if you want
      .sort({ createdAt: -1 });              // newest first

    return res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching posts' });
  }
};


export const add_comment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ message: 'postId and content are required' });
    }

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Fetch user to get name and username
    const user = await User.findById(userId).select('name username avatar');
    console.log(user,'user')
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create and save comment
    const newComment = new Comment({
      postId,
      userId,
      content,
      name: user.name,
      username: user.username,
      avatar:user.avatar,
      likes: [],
      dislikes: []
    });

    await newComment.save();

    // Add comment to post's comments array
    post.comments.push(newComment._id);
    await post.save();

    return res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while adding comment' });
  }
};

export const like_post = async (req, res) => {
  try {
    console.log(req.body,'body')
    const postId = req.body.postId;
    const userId = req.user.id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.includes(userId);
    const hasDisliked = post.dislikes.includes(userId);

    if (hasLiked) {
      // Remove like (toggle off)
      post.likes.pull(userId);
    } else {
      // Add like
      post.likes.push(userId);
      // Remove dislike if exists
      if (hasDisliked) post.dislikes.pull(userId);
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? 'Like removed' : 'Post liked',
      likes: post.likes.length,
      dislikes: post.dislikes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error liking post' });
  }
};

export const dislike_post = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.user.id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasDisliked = post.dislikes.includes(userId);
    const hasLiked = post.likes.includes(userId);

    if (hasDisliked) {
      // Remove dislike (toggle off)
      post.dislikes.pull(userId);
    } else {
      // Add dislike
      post.dislikes.push(userId);
      // Remove like if exists
      if (hasLiked) post.likes.pull(userId);
    }

    await post.save();

    res.status(200).json({
      message: hasDisliked ? 'Dislike removed' : 'Post disliked',
      likes: post.likes.length,
      dislikes: post.dislikes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error disliking post' });
  }
};


export const get_post_by_id = async(req,res)=>{
    try {
        const postId = req.body.postId
        const post = await Post.findById(postId)
        console.log(post,'postdata')
        res.json(post)
    } catch (error) {
        console.error(error);
    res.status(500).json({ message: 'Server error disliking post' });
    }
}

