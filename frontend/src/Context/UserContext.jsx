import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "./AuthContext";

export const userDataContext = createContext();

function UserContext({ children }) {
  let [userData, setUserData] = useState(null);
  let { serverUrl } = useContext(authDataContext);
  let [edit, setEdit] = useState(false);
  let [postData, setPostData] = useState([]);
  let [profileData, setProfileData] = useState(null);
  let [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  // Logged-in user
  const getCurrentUser = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/user/currentuser", {
        withCredentials: true,
      });
      setUserData(result.data);
      
    } catch (error) {
      console.log(error);
      setUserData(null);
    } finally {
    setLoading(false);
  }
  };

  // All posts
  const getPost = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/post/getpost", {
        withCredentials: true,
      });
      setPostData(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Open another user's profile
  const handleGetProfile = async (userName) => {
    try {
      let result = await axios.get(
        `${serverUrl}/api/user/profile/${encodeURIComponent(userName)}`,
        { withCredentials: true }
      );
      setProfileData(result.data);
      navigate(`/profile/${userName}`);
    } catch (error) {
      console.log(error);
    }
  };

 useEffect(() => {
  getCurrentUser();
}, []);

useEffect(() => {
  if (userData) {
    getPost();
  }
}, [userData]);

  const value = {
    userData,
    setUserData,
    loading,
    edit,
    setEdit,
    postData,
    setPostData,
    getPost,
    handleGetProfile,
    profileData,
    setProfileData,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;
