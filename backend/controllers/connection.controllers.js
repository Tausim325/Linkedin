import User from "../models/user.model.js"
import { io, userSocketMap } from "../index.js"
import Connection from "../models/connection.model.js"
import Notification from "../models/notification.model.js"

export const sendConnection = async (req, res) => {
    try {
        let { id } = req.params
        let sender = req.userId
        let user = await User.findById(sender)

        if (sender.toString() === id) {
            return res.status(400).json({ message: "you can not send request yourself" })
        }

        if (user.connection.some((c) => c.toString() === id)) {
            return res.status(400).json({ message: "you are already connected" })
        }

        // Pending request in either direction?
        let existConnection = await Connection.findOne({
            status: "pending",
            $or: [
                { sender, receiver: id },
                { sender: id, receiver: sender },
            ],
        })

        if (existConnection) {
            return res.status(400).json({ message: "request already exist" })
        }

        let newRequest = await Connection.create({
            sender,
            receiver: id,
        })

        let receiverSocketId = userSocketMap.get(id.toString())
        let senderSocketId = userSocketMap.get(sender.toString())

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", {
                updatedUserId: sender.toString(),
                newStatus: "received",
            })
        }

        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", {
                updatedUserId: id.toString(),
                newStatus: "pending",
            })
        }

        return res.status(201).json(newRequest)
    } catch (error) {
        console.log("sendConnection error:", error)
        return res.status(500).json({ message: `sendConnection error ${error.message}` })
    }
}

export const acceptConnection = async (req, res) => {
    try {
        let { connectionId } = req.params
        let userId = req.userId

        let connection = await Connection.findById(connectionId)

        if (!connection) {
            return res.status(404).json({ message: "connection does not exist" })
        }

        // Only the receiver can accept
        if (connection.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "you are not allowed to accept this request" })
        }

        if (connection.status !== "pending") {
            return res.status(400).json({ message: "request already " + connection.status })
        }

        connection.status = "accepted"
        await connection.save()

        await User.findByIdAndUpdate(connection.sender, {
            $addToSet: { connection: connection.receiver },
        })

        await User.findByIdAndUpdate(connection.receiver, {
            $addToSet: { connection: connection.sender },
        })

        // Notify the sender that the request was accepted (saved in DB)
        await Notification.create({
            receiver: connection.sender,
            type: "connectionAccepted",
            relatedUser: connection.receiver,
        })

        // Socket IDs
        const receiverSocketId = userSocketMap.get(connection.receiver.toString())
        const senderSocketId = userSocketMap.get(connection.sender.toString())

        // Update receiver's button
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", {
                updatedUserId: connection.sender.toString(),
                newStatus: "disconnect",
            })
        }

        // Update sender's button
        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", {
                updatedUserId: connection.receiver.toString(),
                newStatus: "disconnect",
            })
        }

        return res.status(200).json({ message: "connection accepted" })
    } catch (error) {
        console.log("acceptConnection error:", error)
        return res.status(500).json({ message: `acceptConnection error ${error.message}` })
    }
}

export const rejectConnection = async (req, res) => {
    try {
        let { connectionId } = req.params
        let userId = req.userId

        let connection = await Connection.findById(connectionId)

        if (!connection) {
            return res.status(404).json({ message: "connection does not exist" })
        }

        // Only the receiver can reject
        if (connection.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "you are not allowed to reject this request" })
        }

        if (connection.status !== "pending") {
            return res.status(400).json({ message: "request already " + connection.status })
        }

        connection.status = "rejected"
        await connection.save()

        return res.status(200).json({ message: "connection rejected" })
    } catch (error) {
        console.log("rejectConnection error:", error)
        return res.status(500).json({ message: `rejectConnection error ${error.message}` })
    }
}

export const getConnectionStatus = async (req, res) => {
    try {
        let targetUserId = req.params.userId
        let currentUserId = req.userId

        // Same user: no button needed
        if (currentUserId.toString() === targetUserId) {
            return res.status(200).json({ status: "self" })
        }

        // Already connected?
        let currentUser = await User.findById(currentUserId)

        if (currentUser.connection.some((c) => c.toString() === targetUserId)) {
            return res.status(200).json({ status: "disconnect" })
        }

        let pendingRequest = await Connection.findOne({
            $or: [
                { sender: currentUserId, receiver: targetUserId },
                { sender: targetUserId, receiver: currentUserId },
            ],
            status: "pending",
        })

        if (pendingRequest) {
            if (pendingRequest.sender.toString() === currentUserId.toString()) {
                return res.status(200).json({ status: "pending" })
            }

            return res.status(200).json({
                status: "received",
                requestId: pendingRequest._id,
            })
        }

        // No connection or pending request
        return res.status(200).json({ status: "connect" })
    } catch (error) {
        console.log("getConnectionStatus error:", error)
        return res.status(500).json({ message: `getConnectionStatus error ${error.message}` })
    }
}

export const removeConnection = async (req, res) => {
    try {
        let otherUserId = req.params.userId
        let myId = req.userId

        if (myId.toString() === otherUserId) {
            return res.status(400).json({ message: "you can not remove yourself" })
        }

        let me = await User.findById(myId)

        let isConnected = me.connection.some((c) => c.toString() === otherUserId)

        if (!isConnected) {
            return res.status(400).json({ message: "you are not connected with this user" })
        }

        await User.findByIdAndUpdate(myId, {
            $pull: { connection: otherUserId },
        })

        await User.findByIdAndUpdate(otherUserId, {
            $pull: { connection: myId },
        })

        // Delete the accepted request between both users (either direction)
        await Connection.deleteMany({
            status: "accepted",
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId },
            ],
        })

        let receiverSocketId = userSocketMap.get(otherUserId.toString())
        let senderSocketId = userSocketMap.get(myId.toString())

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("statusUpdate", {
                updatedUserId: myId.toString(),
                newStatus: "connect",
            })
        }

        if (senderSocketId) {
            io.to(senderSocketId).emit("statusUpdate", {
                updatedUserId: otherUserId.toString(),
                newStatus: "connect",
            })
        }

        return res.status(200).json({ message: "connection removed" })
    } catch (error) {
        console.log("removeConnection error:", error)
        return res.status(500).json({ message: `removeConnection error ${error.message}` })
    }
}

export const getConnectionRequests = async (req, res) => {
    try {
        const userId = req.userId

        const requests = await Connection.find({
            receiver: userId,
            status: "pending",
        })
            .populate("sender", "firstName lastName userName profileImage headline")
            .sort({ createdAt: -1 })

        return res.status(200).json(requests)
    } catch (error) {
        console.error("getConnectionRequests error:", error)
        return res.status(500).json({ message: `getConnectionRequests error ${error.message}` })
    }
}

export const getUserConnections = async (req, res) => {
    try {
        const userId = req.userId

        const user = await User.findById(userId).populate(
            "connection",
            "firstName lastName userName profileImage headline"
        )

        return res.status(200).json(user.connection)
    } catch (error) {
        console.error("Error in getUserConnections controller:", error)
        return res.status(500).json({ message: "Server error" })
    }
}