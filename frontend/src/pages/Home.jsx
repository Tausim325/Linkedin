import React, { useState, useContext, useEffect, useRef } from "react";
import Nav from "../Componenets/Nav";
import profile from "../assets/profile.png";
import { userDataContext } from "../Context/UserContext";
import { FiPlus } from "react-icons/fi";
import { CiCamera } from "react-icons/ci";
import { RiPencilLine } from "react-icons/ri";
import EditProfile from "../Componenets/EditProfile.jsx";
import { RxCross1 } from "react-icons/rx";
import { IoMdImages } from "react-icons/io";
import { authDataContext } from "../Context/AuthContext.jsx";
import axios from "axios";
import Post from "../Componenets/Post.jsx";
import ConnectionButton from "../Componenets/ConnectionButton";

function Home() {
  let { userData, edit, setEdit, postData, setPostData, handleGetProfile, getPost } =
  useContext(userDataContext);
  //let {serveruUrl}=useContext(authDataContext)
  const { serverUrl } = useContext(authDataContext);
  let [frontendImage, setFrontendImage] = useState("");
  let [backendImage, setBackendImage] = useState("");
  let [description, setDescription] = useState("");
  let [showPopup, setShowPopup] = useState(false);
  let [uploadPost, setUploadPost] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  let image = useRef(null);
  let [posting, setPosting] = useState(false);

  let handleImage = (e) => {
    let file = e.target.files[0];

    if (file) {
      if (frontendImage) {
        URL.revokeObjectURL(frontendImage);
      }

      setFrontendImage(URL.createObjectURL(file));
      setBackendImage(file);
    }
  };

  let handleClosePopup = () => {
    setShowPopup(false);
    setUploadPost(false);
    setDescription("");

    if (frontendImage) {
      URL.revokeObjectURL(frontendImage);
    }

    setFrontendImage("");
    setBackendImage("");

    if (image.current) {
      image.current.value = "";
    }
  };

  let handleOpenPopup = () => {
    setShowPopup(true);
    setUploadPost(true);
  };

  async function handleUploadPost() {
    setPosting(true);

    try {
      let formdata = new FormData();

      formdata.append("description", description);

      if (backendImage) {
        formdata.append("image", backendImage);
      }

      let result = await axios.post(serverUrl + "/api/post/create", formdata, {
        withCredentials: true,
      });
   
      await getPost();
      handleClosePopup();
      setUploadPost(false);
    } catch (error) {
      console.log(error);
    } finally {
      setPosting(false);
    }
  }
  // Load suggested users from backend
  const handleSuggestedUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/suggestedusers`, {
        withCredentials: true,
      });
  

      setSuggestedUsers(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleSuggestedUser();
  }, []);

  return (
    <div className="w-full min-h-[100vh] bg-[#f0efe7] pt-[68px] flex items-start justify-center gap-[5px] px-[3px] flex-col lg:flex-row relative">
      {edit && <EditProfile />}

      <Nav />

      {/* Left: Profile Card */}
      <div className="w-full lg:w-[25%] min-h-[200px] bg-white  rounded-lg">
        <div
          className="relative w-full h-[80px] bg-gray-400 overflow-hidden flex items-center justify-center rounded cursor-pointer"
          onClick={() => setEdit(true)}
        >
          {userData?.coverImage && (
            <img
              src={userData.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          <CiCamera className="absolute right-[10px] top-[8px] text-gray-500 text-2xl" />
        </div>

        <div
          className="w-[50px] h-[50px] rounded-full overflow-hidden relative top-[-15px] ml-[10px] cursor-pointer"
          onClick={() => setEdit(true)}
        >
          <img
            src={userData?.profileImage || profile}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className="w-[15px] h-[15px] bg-[#65cfec] relative top-[-40px] left-[42px] rounded-full flex justify-center items-center cursor-pointer"
          onClick={() => setEdit(true)}
        >
          <FiPlus className="text-white" />
        </div>

        <div className="relative left-[12px] -top-[15px]">
          <div>
            {`${userData?.firstName || ""} ${userData?.lastName || ""}`}
          </div>

          <div className="text-[14px]">{userData?.headline || ""}</div>

          <div className="text-[14px]">{userData?.location || ""}</div>
        </div>

        <button
          className="w-full h-[40px] my-[20px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] mt-[5px] flex items-center justify-center gap-[10px]"
          onClick={() => setEdit(true)}
        >
          Edit Profile <RiPencilLine />
        </button>
      </div>

      {/* Middle: Post / Feed  */}
      <div className="w-full lg:w-[50%] min-h-[200px] bg-[#f0efe7] flex flex-col gap-[5px]">
        <div className="w-full min-h-[120px] bg-white shadow-lg rounded-lg flex items-center justify-center gap-[10px] p-[15px]">
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center">
            <img
              src={userData?.profileImage || profile}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={handleOpenPopup}
            className="w-[80%] h-[60px] border-2 rounded-full border-gray-500 flex items-center justify-start px-[20px] hover:bg-gray-200"
          >
            Start a post
          </button>
        </div>
        {/* post content */}
        {postData.map((post, index) => (
          <Post
            key={post._id}
            id={post._id}
            description={post.description}
            author={post.author}
            image={post.image}
            like={post.like}
            comment={post.comment}
            createdAt={post.createdAt}
          />
        ))}
      </div>

      {/* Right: Suggestions / News */}
      <div className="hidden lg:block w-[300px] bg-white rounded-lg shadow-lg p-[20px] h-fit">
        <div className="text-[18px] font-semibold mb-[12px]">
          Suggested for you
        </div>

        {suggestedUsers.length === 0 && (
          <div className="text-gray-500 text-[14px]">
            No suggestions right now
          </div>
        )}

        <div className="flex flex-col gap-[16px]">
          {suggestedUsers.map((u) => (
            <div key={u._id} className="flex flex-col gap-[8px]">
              <div
                className="flex items-center gap-[10px] cursor-pointer"
                onClick={() => handleGetProfile(u.userName)}
              >
                <img
                  src={u.profileImage || profile}
                  alt=""
                  className="w-[44px] h-[44px] rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold truncate">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-[12px] text-gray-500 truncate">
                    {u.headline}
                  </div>
                </div>
              </div>
              <ConnectionButton userId={u._id} />
            </div>
          ))}
        </div>
      </div>

      {/* Create Posting Popup */}
      {showPopup && uploadPost && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={handleClosePopup}
          ></div>

          {/* Popup */}
          <div className="fixed z-[200] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto bg-white shadow-lg rounded-lg p-[15px]">
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                type="button"
                className="cursor-pointer"
                onClick={handleClosePopup}
              >
                <RxCross1
                  className="w-[22px] h-[22px] text-gray-800"
                  onClick={() => setUploadPost(false)}
                />
              </button>
            </div>

            {/* User Information */}
            <div className="flex justify-start items-center gap-2">
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden ml-[10px]">
                <img
                  src={userData?.profileImage || profile}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="ml-[12px]">
                {`${userData?.firstName || ""} ${userData?.lastName || ""}`}
              </div>
            </div>

            {/* Post Description */}
            <textarea
              className={`w-full ${frontendImage ? "h-[100px]" : "h-[250px]"} outline-none border-none p-[10px] resize-none text-[19px]`}
              placeholder="What do you want to talk about...?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {/* Image Preview */}
            {frontendImage && (
              <div className="w-full h-[200px] overflow-hidden mb-[10px]">
                <img
                  src={frontendImage}
                  alt="Post Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={image}
              hidden
              accept="image/*"
              onChange={handleImage}
            />

            {/* Image Picker */}
            <div className="w-full flex flex-col">
              <div className="p-[12px] flex items-center justify-start border-b border-gray-300">
                <IoMdImages
                  className="w-[24px] h-[24px] text-gray-500 cursor-pointer"
                  onClick={() => image.current?.click()}
                />
              </div>

              {/* Post Button */}
              <div className="flex justify-end mt-[10px]">
                <button
                  type="button"
                  disabled={posting || (!description.trim() && !backendImage)}
                  className="bg-[#0a66c2] text-white text-[16px] font-semibold px-[24px] py-[8px] rounded-full cursor-pointer hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUploadPost}
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
