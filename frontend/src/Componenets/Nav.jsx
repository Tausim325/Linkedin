import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { AiFillHome } from "react-icons/ai";
import { FaUserFriends, FaCommentDots, FaBriefcase } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import logo from "../assets/Logo.png";
import profile from "../assets/profile.png";
import { userDataContext } from "../Context/UserContext";
import { authDataContext } from "../Context/AuthContext";

function Nav() {
  const { userData, setUserData, handleGetProfile } =
    useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [showPopUp, setShowPopUp] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const handleSignOut = async () => {
  try {
    await axios.get(serverUrl + "/api/auth/logout", {
      withCredentials: true,
    });
  } catch (error) {
    console.log(error);
  } finally {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/login");
  }
};
  // Search with 400ms debounce (no API call on every key press)
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchData([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/search?query=${encodeURIComponent(searchInput)}`,
          { withCredentials: true },
        );
        setSearchData(result.data);
      } catch (error) {
        console.log(error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Dropdown list of search results (used in both mobile and laptop)
  const searchDropdown = searchData.length > 0 && (
    <div className="absolute top-[45px] left-0 w-full bg-white shadow-lg rounded-lg max-h-[300px] overflow-y-auto z-[100]">
      {searchData.map((u) => (
        <div
          key={u._id}
          className="flex items-center gap-[10px] p-[10px] hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            handleGetProfile(u.userName);
            setSearchInput("");
            setSearchData([]);
          }}
        >
          <img
            src={u.profileImage || profile}
            alt=""
            className="w-[36px] h-[36px] rounded-full object-cover"
          />
          <div>
            <div className="text-[14px] font-semibold">
              {u.firstName} {u.lastName}
            </div>
            <div className="text-[12px] text-gray-500">{u.headline}</div>
          </div>
        </div>
      ))}
    </div>
  );
  const showComingSoon = (name) => {
    setToast(`${name} feature coming soon `);
    setTimeout(() => setToast(""), 2000);
  };
  return (
    <>
      <div className="w-full h-[65px] bg-white fixed top-0 left-0 z-50 shadow-lg">
        {/* ========== MOBILE VERSION ========== */}
        <div className="md:hidden h-full flex items-center gap-3 px-3">
          {/* left: profile */}
          <div
            className="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer shrink-0"
            onClick={() => setShowPopUp((prev) => !prev)}
          >
            <img
              src={userData?.profileImage || profile}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* middle: search box */}
          <form
            className="relative flex-1 min-w-0 flex items-center gap-[8px] h-[38px] bg-[#e9ecef] rounded-md px-[12px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchData.length > 0) {
                handleGetProfile(searchData[0].userName);
                setSearchInput("");
                setSearchData([]);
              }
            }}
          >
            <CiSearch className="text-[20px] text-gray-700 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-full bg-transparent outline-none text-[14px] placeholder:text-gray-600"
            />
            {searchDropdown}
          </form>

          {/* right: notifications */}
          <div
            className="cursor-pointer text-gray-600 hover:text-black shrink-0"
            onClick={() => navigate("/notification")}
          >
            <IoNotifications className="text-[24px]" />
          </div>
        </div>

        {/* ========== LAPTOP VERSION ========== */}
        <div className="hidden md:flex h-full items-center px-6 lg:px-[96px]">
          {/* left part: logo + search */}
          <div className="flex items-center gap-[10px]">
            <img
              src={logo}
              alt="logo"
              className="w-[40px] cursor-pointer"
              onClick={() => navigate("/")}
            />
            <form
              className="relative flex items-center gap-[8px] w-[240px] lg:w-[280px] h-[38px] bg-[#e9ecef] rounded-md px-[12px]"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchData.length > 0) {
                  handleGetProfile(searchData[0].userName);
                  setSearchInput("");
                  setSearchData([]);
                }
              }}
            >
              <CiSearch className="text-[20px] text-gray-700 shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-0 h-full bg-transparent outline-none text-[14px] placeholder:text-gray-600"
              />
              {searchDropdown}
            </form>
          </div>

          {/* right part */}
          <div className="flex items-center gap-[18px] lg:gap-[24px] ml-auto relative">
            {/* popup */}
            {showPopUp && (
              <div className="w-[300px] h-[300px] bg-white shadow-xl absolute top-[45px] left-[130px] rounded-lg flex flex-col p-[10px]">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden cursor-pointer shrink-0">
                  <img
                    src={userData?.profileImage || profile}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-[18px] font-semibold text-gray-700">
                  {`${userData?.firstName} ${userData?.lastName}`}
                </div>

                <button
                  className="w-full h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] mt-[10px]"
                  onClick={() => {
                    navigate("/profile");
                    setShowPopUp(false);
                  }}
                >
                  View Profile
                </button>

                <div className="w-full h-[1px] bg-gray-300 mt-[10px]"></div>

                <button
                  className="self-center mt-auto h-[36px] px-[20px] rounded-full border-2 border-[rgb(246,62,49)] text-[red]"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}

            <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => navigate("/")}
            >
              <AiFillHome className="text-[22px]" />
              <span className="text-[12px]">Home</span>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => navigate("/network")}
            >
              <FaUserFriends className="text-[22px]" />
              <span className="text-[12px]">My Network</span>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => showComingSoon("Jobs")}
            >
              <FaBriefcase className="text-[22px]" />
              <span className="text-[12px]">Jobs</span>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => showComingSoon("Messaging")}
            >
              <FaCommentDots className="text-[22px]" />
              <span className="text-[12px]">Messaging</span>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => navigate("/notification")}
            >
              <IoNotifications className="text-[22px]" />
              <span className="text-[12px]">Notifications</span>
            </div>

            <div
              className="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
              onClick={() => setShowPopUp((prev) => !prev)}
            >
              <img
                src={userData?.profileImage || profile}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        {toast && (
          <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[200] bg-gray-800 text-white text-[14px] px-[18px] py-[10px] rounded-full shadow-lg">
            {toast}
          </div>
        )}
      </div>

      {/* ========== MOBILE PROFILE POPUP ========== */}
      {showPopUp && (
        <div className="md:hidden fixed top-[70px] left-[10px] w-[260px] bg-white shadow-xl rounded-lg p-[12px] flex flex-col z-[60]">
          <div className="text-[16px] font-semibold text-gray-700">
            {userData?.firstName} {userData?.lastName}
          </div>
          <button
            className="w-full h-[36px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] mt-[8px]"
            onClick={() => {
              navigate("/profile");
              setShowPopUp(false);
            }}
          >
            View Profile
          </button>
          <button
            className="h-[34px] rounded-full border-2 border-[rgb(246,62,49)] text-[red] mt-[8px]"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}

      {/* ========== MOBILE BOTTOM BAR ========== */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[50px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)] flex items-center justify-around z-50">
        <div
          className="flex flex-col items-center cursor-pointer text-gray-600"
          onClick={() => navigate("/")}
        >
          <AiFillHome className="text-[22px]" />
          <span className="text-[11px]">Home</span>
        </div>

        <div
          className="flex flex-col items-center cursor-pointer text-gray-600"
          onClick={() => navigate("/network")}
        >
          <FaUserFriends className="text-[22px]" />
          <span className="text-[11px]">My Network</span>
        </div>

        <div
          className="flex flex-col items-center cursor-pointer text-gray-600"
          onClick={() => showComingSoon("Jobs")}
        >
          <FaBriefcase className="text-[22px]" />
          <span className="text-[11px]">Jobs</span>
        </div>

        <div
              className="flex flex-col items-center cursor-pointer text-gray-600 hover:text-black"
              onClick={() => showComingSoon("Messaging")}
            >
              <FaCommentDots className="text-[22px]" />
              <span className="text-[12px]">Messaging</span>
            </div>
      </div>
    </>
  );
}

export default Nav;
