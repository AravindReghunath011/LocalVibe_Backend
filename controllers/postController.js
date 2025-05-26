import Comment from "../models/CommentModel.js";
import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";


const POST_TYPES = [
  'Recommendation',
  'Needed help',
  'Local update',
  'Event'
];

export const create_post = async (req, res) => {
  try {
    const { type, location, content, media } = req.body;
    const userId = req.user.id; // from auth middleware

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
    const user = await User.findById(userId).select('name username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the post with denormalized user info
    const newPost = new Post({
      userId,
      username: user.username,
      name: user.name,
      type,
      location,
      content,
      media: media || [],
      comments: [],
      likes: [],
      dislikes: []
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
    const { type, longitude, latitude, radius } = req.body || {};

    const query = {};

    // Filter by post type if provided
    if (type) {
      query.type = type;
    }

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
      .populate('userId', 'name username')  // optional, populate user info
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
    const user = await User.findById(userId).select('name username');
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

