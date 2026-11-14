import React, { useState, useContext, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import profile from "../assets/profile.png";
import { AiOutlineLike } from "react-icons/ai";
import { BiSolidLike } from "react-icons/bi";
import { FaCommentDots } from "react-icons/fa";
import { LuSendHorizontal } from "react-icons/lu";
import { authDataContext } from "../Context/AuthContext";
import { userDataContext } from "../Context/UserContext";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { io } from "socket.io-client";
import ConnectionButton from "./ConnectionButton";

// Same URL as your serverUrl
let socket = io("https://linkedin-backend-9boo.onrender.com", {
  withCredentials: true,
});

function Post({ id, author, like, comment, description, image, createdAt }) {
  const [more, setMore] = useState(false);
  const { serverUrl } = useContext(authDataContext);
  const { userData, handleGetProfile } = useContext(userDataContext);

  const [likes, setLikes] = useState(like || []);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState(comment || []);
  const [showComment, setShowComment] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const isLiked = likes.some((l) => l.toString() === userData?._id);
const { getPost } = useContext(userDataContext);
const [showPostMenu, setShowPostMenu] = useState(false);
  // Open this author's profile
  const openProfile = () => {
    if (author?.userName) handleGetProfile(author.userName);
  };

  const handlelike = async () => {
    try {
      const result = await axios.post(
        serverUrl + `/api/post/like/${id}`,
        {},
        { withCredentials: true },
      );
      setLikes(result.data.like);
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      const result = await axios.post(
        serverUrl + `/api/post/comment/${id}`,
        { content: commentContent },
        { withCredentials: true },
      );
      setComments(result.data.comment);
      setCommentContent("");
    } catch (error) {
      console.log(error);
    }
  };

  // Delete a comment by its id
  const handleDeleteComment = async (commentId) => {
    try {
      const result = await axios.delete(
        serverUrl + `/api/post/comment/${id}/${commentId}`,
        { withCredentials: true },
      );
      setComments(result.data.comment);
      setOpenMenuId(null);
    } catch (error) {
      console.log(error);
    }
  };

  // Real-time updates: likes and comments
  useEffect(() => {
    const onLikeUpdated = ({ postId, likes }) => {
      if (postId == id) setLikes(likes);
    };
    const onCommentUpdated = ({ postId, comments }) => {
      if (postId == id) setComments(comments);
    };

    socket.on("likeUpdated", onLikeUpdated);
    socket.on("commentUpdated", onCommentUpdated);

    return () => {
      socket.off("likeUpdated", onLikeUpdated);
      socket.off("commentUpdated", onCommentUpdated);
    };
  }, [id]);
// delete post
const handleDeletePost = async () => {
  if (!window.confirm("Delete this post?")) return;
  try {
    await axios.delete(`${serverUrl}/api/post/delete/${id}`, {
      withCredentials: true,
    });
    await getPost();
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="w-full min-h-[200px] bg-white rounded-lg shadow-lg pb-[20px]">
      <div className="w-full flex items-center justify-between pr-[20px]">
        <div className="flex items-center gap-[15px]">
          <div
            className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer mt-[20px] ml-[20px]"
            onClick={openProfile}
          >
            <img
              src={author?.profileImage || profile}
              alt=""
              className="h-full"
            />
          </div>
          <div className="mt-[20px] cursor-pointer" onClick={openProfile}>
            <div className="text-[16px] font-semibold">
              {author?.firstName} {author?.lastName}
            </div>
            <div className="text-[14px] text-gray-600">
              {author?.headline || ""}
            </div>
            <div className="text-[12px] text-gray-500">
              {moment(createdAt).fromNow()}
            </div>
          </div>
        </div>

        {/* Connect button */}
        {userData && author?._id !== userData._id && (
          <ConnectionButton userId={author?._id} />
        )}

        {userData && author?._id === userData._id && (
  <div className="relative">
    <BsThreeDots
      className="w-[22px] h-[22px] text-gray-500 hover:text-black cursor-pointer"
      onClick={() => setShowPostMenu((prev) => !prev)}
    />
    {showPostMenu && (
      <div className="absolute right-0 top-[28px] z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-[130px]">
        <button
          onClick={() => {
            setShowPostMenu(false);
            handleDeletePost();
          }}
          className="w-full flex items-center gap-[6px] px-[12px] py-[8px] text-[14px] text-red-500 hover:bg-gray-100"
        >
          <MdDelete className="w-[18px] h-[18px]" />
          Delete post
        </button>
      </div>
    )}
  </div>
)}
      </div>

      <div
        className={`w-full ${!more ? "max-h-[100px] overflow-hidden" : ""} pl-[50px]`}
      >
        {description}
      </div>
      <div
        className="pl-[50px] text-[14px] font-semibold cursor-pointer"
        onClick={() => setMore((prev) => !prev)}
      >
        {more ? "read less..." : "read more"}
      </div>

      {image && (
        <div className="w-full mt-[15px] overflow-hidden">
          <img
            src={image}
            alt="post"
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      <div>
        <div className="w-full flex justify-between items-center p-[20px] border-b-2 border-gray-500">
          <div className="flex items-center justify-center gap-[5px] text-[18px]">
            <AiOutlineLike className="text-[#1ebbff] w-[20px] h-[20px]" />
            <span>{likes.length}</span>
          </div>
          <div className="flex items-center justify-center gap-[5px] text-[18px]">
            <span>{comments.length}</span>
            <span>comments</span>
          </div>
        </div>

        <div className="flex items-center w-full p-[20px] gap-[20px]">
          <div
            className="flex justify-center items-center gap-[5px] cursor-pointer"
            onClick={handlelike}
          >
            <BiSolidLike
              className={`w-[24px] h-[24px] ${isLiked ? "text-[#07a4ff]" : ""}`}
            />
            <span className={isLiked ? "text-[#07a4ff] font-semibold" : ""}>
              {isLiked ? "Liked" : "Like"}
            </span>
          </div>

          <div
            className="flex justify-center items-center gap-[5px] cursor-pointer"
            onClick={() => setShowComment((prev) => !prev)}
          >
            <FaCommentDots className="w-[24px] h-[24px]" />
            <span>comment</span>
          </div>
        </div>

        {/* show comment */}
        {showComment && (
          <div>
            <form
              className="w-full flex justify-between items-center border-b-2 border-b-gray-300 p-[10px]"
              onSubmit={handleComment}
            >
              <input
                type="text"
                placeholder="leave a comment"
                className="outline-none border-none flex-1"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <button type="submit">
                <LuSendHorizontal className="text-[#07a4ff] w-[22px] h-[22px]" />
              </button>
            </form>
            <div className="flex flex-col gap-[10px] p-[10px]">
              {comments.map((c) => {
                const canDelete =
                  c.user?._id === userData?._id ||
                  author?._id === userData?._id;

                return (
                  <div key={c._id} className="flex items-start gap-[10px]">
                    <img
                      src={c.user?.profileImage || profile}
                      alt=""
                      className="w-[30px] h-[30px] rounded-full object-cover"
                    />

                    <div className="flex-1">
                      <div className="text-[14px] font-semibold">
                        {c.user?.firstName} {c.user?.lastName}
                      </div>
                      <div className="text-[12px] text-gray-500">
                        {c.user?.headline}
                      </div>
                      <div className="text-[14px]">{c.content}</div>
                    </div>

                    {/* Three dots menu */}
                    {canDelete && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === c._id ? null : c._id)
                          }
                          title="More options"
                        >
                          <BsThreeDots className="w-[20px] h-[20px] text-gray-500 hover:text-black mr-2" />
                        </button>

                        {openMenuId === c._id && (
                          <div className="absolute right-0 top-[24px] z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-[110px]">
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="w-full flex items-center gap-[6px] px-[12px] py-[8px] text-[14px] text-red-500 hover:bg-gray-100"
                            >
                              <MdDelete className="w-[18px] h-[18px]" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Post;
