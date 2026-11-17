
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";

const socket = io("");

function ConnectionButton({ userId }) {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetStatus = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/connection/getStatus/${userId}`,
        { withCredentials: true }
      );

      setStatus(result.data.status);
    } catch (error) {
      console.error(
        "Status error:",
        error.response?.data || error.message
      );
    }
  };

  const handleSendConnection = async () => {
    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/connection/send/${userId}`,
        {},
        { withCredentials: true }
      );

      console.log("Connection response:", result.data);
      await handleGetStatus();
    } catch (error) {
      console.error("HTTP status:", error.response?.status);
      console.error(
        "Backend error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setLoading(true);

      const result = await axios.delete(
        `${serverUrl}/api/connection/remove/${userId}`,
        { withCredentials: true }
      );

      console.log("Remove response:", result.data);
      await handleGetStatus();
    } catch (error) {
      console.error(
        "Remove error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !userData?._id) return;

    const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
      if (updatedUserId === userId) {
        setStatus(newStatus);
      }
    };

    socket.emit("register", userData._id);
    handleGetStatus();

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId, userData?._id, serverUrl]);

  const handleClick = async () => {
    if (loading) return;

    if (status === "disconnect") {
      await handleRemoveConnection();
    } else if (status === "received") {
      navigate("/Network");
    } else if (status === "connect") {
      await handleSendConnection();
    }
  };

  const buttonText = {
    connect: "Connect",
    pending: "Pending",
    received: "Respond",
    disconnect: "Disconnect",
    self: "You",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || status === "self"}
      className="min-w-[100px] h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] disabled:opacity-50"
    >
      {loading ? "Please wait..." : buttonText[status] || "Connect"}
    </button>
  );
}

export default ConnectionButton;
