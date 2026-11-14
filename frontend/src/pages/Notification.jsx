import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Nav from "../Componenets/Nav";
import profile from "../assets/profile.png";
import { authDataContext } from "../Context/AuthContext";
import { RxCross1 } from "react-icons/rx";

function Notification() {
  const { serverUrl } = useContext(authDataContext);
  const [notifications, setNotifications] = useState([]);

  const getNotifications = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/notification/get`, {
        withCredentials: true,
      });
      setNotifications(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/notification/deleteone/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverUrl}/api/notification`, {
        withCredentials: true,
      });
      setNotifications([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  // Text for each notification type
  const getText = (type) => {
    if (type === "like") return "liked your post";
    if (type === "comment") return "commented on your post";
    if (type === "connectionAccepted") return "accepted your connection request";
    return "";
  };

  return (
    <div className="w-full min-h-screen bg-[#f0efe7] pt-[90px] pb-[40px]">
      <Nav />
      <div className="w-full max-w-[700px] mx-auto px-[10px] flex flex-col gap-[12px]">
        <div className="bg-white rounded-lg shadow p-[16px] flex justify-between items-center">
          <div className="text-[20px] font-semibold">
            Notifications ({notifications.length})
          </div>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[14px] text-red-500 border border-red-400 rounded-full px-[14px] h-[32px]"
            >
              Clear all
            </button>
          )}
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-lg shadow p-[20px] text-gray-500 text-center">
            No notifications
          </div>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            className="bg-white rounded-lg shadow p-[14px] flex items-center gap-[12px]"
          >
            <img
              src={n.relatedUser?.profileImage || profile}
              alt=""
              className="w-[48px] h-[48px] rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[15px]">
                <span className="font-semibold">
                  {n.relatedUser?.firstName} {n.relatedUser?.lastName}
                </span>{" "}
                {getText(n.type)}
              </div>
              {n.relatedPost?.description && (
                <div className="text-[13px] text-gray-500 truncate">
                  {n.relatedPost.description}
                </div>
              )}
            </div>
            {n.relatedPost?.image && (
              <img
                src={n.relatedPost.image}
                alt=""
                className="w-[48px] h-[48px] rounded object-cover"
              />
            )}
            <RxCross1
              className="w-[18px] h-[18px] cursor-pointer text-gray-500 hover:text-black shrink-0"
              onClick={() => handleDeleteOne(n._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notification;