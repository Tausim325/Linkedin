import Notification from "../models/notification.model.js"

export const getNotifications=async (req,res)=>{
    try {
        let notification=await Notification.find({receiver:req.userId})
        .populate("relatedUser","firstName lastName profileImage")
        .populate("relatedPost","image description")
        .sort({ createdAt: -1 })
         return res.status(200).json(notification)
    } catch (error) {
        return res.status(500).json({message:`get notification error ${error}`})
    }
}
// Delete one notification
export const deleteNotification = async (req, res) => {
    try {
        let { id } = req.params
        const deleted = await Notification.findOneAndDelete({
            _id: id,
            receiver: req.userId,   // so nobody can delete someone else's notification
        })
        if (!deleted) {
            return res.status(404).json({ message: "notification not found" })
        }
        return res.status(200).json({ message: "notification deleted" }) 
    } catch (error) {
        console.log("deleteNotification error:", error)
        return res.status(500).json({ message: `delete notification error ${error.message}` })
    }
}
// Delete all my notifications
export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ receiver: req.userId })
        return res.status(200).json({ message: "all notifications cleared" })
    } catch (error) {
        console.log("clearAllNotifications error:", error)
        return res.status(500).json({ message: `clear notifications error ${error.message}` })
    }
}