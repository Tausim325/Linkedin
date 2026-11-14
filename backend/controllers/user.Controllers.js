import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/Cloudinary.js";
import Connection from "../models/connection.model.js"

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user does not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "get current user error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, userName, headline, location, gender } = req.body;

    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    const education = req.body.education ? JSON.parse(req.body.education) : [];
    const experience = req.body.experience ? JSON.parse(req.body.experience) : [];

    const updates = {
      firstName,
      lastName,
      userName,
      headline,
      location,
      skills,
      education,
      experience,
    };

    if (["male", "female", "other"].includes(gender)) {
      updates.gender = gender;
    }

    if (userName) {
      const exist = await User.findOne({ userName, _id: { $ne: req.userId } });
      if (exist) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    const profileFile = req.files?.profileImage?.[0];
    const coverFile = req.files?.coverImage?.[0];
    if (profileFile) updates.profileImage = await uploadOnCloudinary(profileFile.path);
    if (coverFile) updates.coverImage = await uploadOnCloudinary(coverFile.path);

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "update profile error" });
  }
};

export const getprofile=async (req,res)=>{
    try {
        let {userName}=req.params
        let user=await User.findOne({userName}).select("-password")
        if(!user){
            return res.status(400).json({message:"userName does not exist"})
        }
        return res.status(200).json(user)
    } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "getprofile error" });
    }
} 

export const search = async (req, res) => {
    try {
        let { query } = req.query
        if (!query || !query.trim()) {
            return res.status(200).json([])
        }

        // Escape regex special characters, then split into words ("md raza" -> ["md", "raza"])
        const words = query
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .split(/\s+/)

        // Every word must match at least one field
        let users = await User.find({
            _id: { $ne: req.userId },   // hide myself from results
            $and: words.map((w) => ({
                $or: [
                    { firstName: { $regex: w, $options: "i" } },
                    { lastName: { $regex: w, $options: "i" } },
                    { userName: { $regex: w, $options: "i" } },
                    { skills: { $regex: w, $options: "i" } },
                ],
            })),
        })
            .select("firstName lastName userName profileImage headline")
            .limit(10)

        return res.status(200).json(users)
    } catch (error) {
        console.log("search error:", error)
        return res.status(500).json({ message: `search error ${error.message}` })
    }
}
export const getSuggestedUser = async (req, res) => {
    try {
        // Only the connection field is needed (note: string in quotes)
        const currentUser = await User.findById(req.userId).select("connection")
        const myConnections = currentUser?.connection || []

        // Users with a pending request in either direction
        const pending = await Connection.find({
            status: "pending",
            $or: [{ sender: req.userId }, { receiver: req.userId }],
        })
        const pendingIds = pending.map((c) =>
            c.sender.toString() === req.userId.toString() ? c.receiver : c.sender
        )

        // Exclude: myself, my connections, pending users
        const excludeIds = [req.userId, ...myConnections, ...pendingIds]

        const suggestedUsers = await User.find({ _id: { $nin: excludeIds } })
            .select("firstName lastName userName profileImage headline")
            .limit(10)

        return res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log("suggestedUser error:", error)
        return res.status(500).json({ message: `suggestedUser error ${error.message}` })
    }
}
