import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Nav from "../Componenets/Nav";
import Post from "../Componenets/Post";
import EditProfile from "../Componenets/EditProfile";
import ConnectionButton from "../Componenets/ConnectionButton";
import { userDataContext } from "../Context/UserContext";
import { authDataContext } from "../Context/AuthContext";
import profile from "../assets/profile.png";
import { MdEdit } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { FaUniversity } from "react-icons/fa";

function Profile() {
  const { userName } = useParams();
  const { serverUrl } = useContext(authDataContext);
  const { userData, edit, setEdit, postData } = useContext(userDataContext);

  // The profile being shown (mine or someone else's)
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      // /profile (no userName in URL) = my own profile
      if (!userName) {
        setProfileData(userData);
        return;
      }
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/profile/${encodeURIComponent(userName)}`,
          { withCredentials: true }
        );
        setProfileData(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    loadProfile();
  }, [userName, userData]);

  const isOwnProfile = !userName || profileData?._id === userData?._id;

  if (!profileData) {
    return <div className="pt-[100px] text-center">Loading...</div>;
  }

  // Only this profile's posts
  const myPosts = (postData || []).filter(
    (p) => p.author?._id === profileData?._id
  );

  const firstEdu = profileData?.education?.[0];

  return (
    <div className="w-full min-h-screen bg-[#f0efe7] pt-[90px] pb-[40px]">
      <Nav />

      {/* Edit profile popup (only on my own profile) */}
      {isOwnProfile && edit && <EditProfile />}

      <div className="w-full max-w-[1128px] mx-auto px-[10px] flex gap-[24px] items-start">
        {/* ================= LEFT: main column ================= */}
        <div className="flex-1 min-w-0 flex flex-col gap-[16px]">
          {/* ---------- Top profile card ---------- */}
          <div className="bg-white rounded-lg shadow overflow-hidden relative">
            {/* Cover */}
            <div className="w-full h-[200px] bg-gray-300 relative">
              {profileData?.coverImage && (
                <img
                  src={profileData.coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setEdit(true)}
                  className="absolute top-[14px] right-[14px] w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow"
                >
                  <FaCamera  className="w-[18px] h-[18px] text-gray-700" />
                </button>
              )}
            </div>

            {/* Profile photo overlapping the cover */}
            <div className="absolute top-[200px] -translate-y-1/2 left-[24px] w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-white bg-white">
              <img
                src={profileData?.profileImage || profile}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Edit pencil under cover (right side) */}
            <div className="flex justify-end px-[24px] pt-[14px] h-[50px]">
              {isOwnProfile && (
                <button
                  onClick={() => setEdit(true)}
                  className="w-[34px] h-[34px] rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <MdEdit className="w-[20px] h-[20px] text-gray-600" />
                </button>
              )}
            </div>

            {/* Info block */}
            <div className="px-[24px] pb-[24px] mt-[40px] flex flex-wrap justify-between gap-[16px]">
              {/* Left info */}
              <div className="min-w-0 max-w-[560px]">
                <div className="text-[24px] font-semibold leading-tight">
                  {profileData?.firstName} {profileData?.lastName}
                </div>
                <div className="text-[16px] text-gray-800 mt-[4px]">
                  {profileData?.headline}
                </div>
                <div className="text-[14px] text-gray-500 mt-[6px]">
                  {profileData?.location}
                  <span className="text-[#6d28d9] font-semibold cursor-pointer">
                    {profileData?.location && " · "}Contact info
                  </span>
                </div>
                <div className="text-[14px] text-[#0a66c2] font-semibold mt-[6px] cursor-pointer hover:underline">
                  {profileData?.connection?.length || 0} connections
                </div>
              </div>

              {/* Right: first education */}
              {firstEdu && (
                <div className="flex items-center gap-[10px] self-start">
                  <div className="w-[36px] h-[36px] bg-yellow-400 rounded flex items-center justify-center">
                    <FaUniversity className="text-white" />
                  </div>
                  <div className="text-[14px] font-semibold">
                    {firstEdu.college}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-[24px] pb-[24px] flex flex-wrap gap-[10px]">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setEdit(true)}
                    className="h-[34px] px-[18px] rounded-full bg-[#0a66c2] text-white font-semibold text-[15px]"
                  >
                    Edit Profile
                  </button>
                  <button className="h-[34px] px-[18px] rounded-full border-2 border-[#0a66c2] text-[#0a66c2] font-semibold text-[15px]">
                    Add section
                  </button>
                  <button className="h-[34px] px-[18px] rounded-full border-2 border-[#0a66c2] text-[#0a66c2] font-semibold text-[15px]">
                    Enhance profile
                  </button>
                  <button className="h-[34px] px-[18px] rounded-full border border-gray-500 text-gray-700 font-semibold text-[15px]">
                    Resources
                  </button>
                </>
              ) : (
                // Someone else's profile: Connect / Pending / Disconnect button
                <ConnectionButton userId={profileData?._id} />
              )}
            </div>
          </div>

          {/* ---------- Skills ---------- */}
          {profileData?.skills?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-[24px]">
              <div className="flex justify-between items-center mb-[12px]">
                <div className="text-[20px] font-semibold">Skills</div>
                {isOwnProfile && (
                  <button onClick={() => setEdit(true)}>
                    <MdEdit className="w-[20px] h-[20px] text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {profileData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-[14px] py-[6px] rounded-full bg-gray-100 border border-gray-300 text-[14px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Education ---------- */}
          {profileData?.education?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-[24px]">
              <div className="flex justify-between items-center mb-[12px]">
                <div className="text-[20px] font-semibold">Education</div>
                {isOwnProfile && (
                  <button onClick={() => setEdit(true)}>
                    <MdEdit className="w-[20px] h-[20px] text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-[14px]">
                {profileData.education.map((edu, i) => (
                  <div key={i} className="flex gap-[12px]">
                    <div className="w-[48px] h-[48px] bg-yellow-400 rounded flex items-center justify-center shrink-0">
                      <FaUniversity className="text-white text-[20px]" />
                    </div>
                    <div>
                      <div className="font-semibold">{edu.college}</div>
                      <div className="text-[14px] text-gray-600">
                        {edu.degree}
                        {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Experience ---------- */}
          {profileData?.experience?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-[24px]">
              <div className="flex justify-between items-center mb-[12px]">
                <div className="text-[20px] font-semibold">Experience</div>
                {isOwnProfile && (
                  <button onClick={() => setEdit(true)}>
                    <MdEdit className="w-[20px] h-[20px] text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-[14px]">
                {profileData.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="font-semibold">{exp.title}</div>
                    <div className="text-[14px] text-gray-600">{exp.company}</div>
                    <div className="text-[13px] text-gray-500">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Posts ---------- */}
          <div className="bg-white rounded-lg shadow p-[24px] text-[20px] font-semibold">
            Posts ({myPosts.length})
          </div>
          {myPosts.map((post) => (
            <Post
              key={post._id}
              id={post._id}
              author={post.author}
              like={post.like}
              comment={post.comment}
              description={post.description}
              image={post.image}
              createdAt={post.createdAt}
            />
          ))}
        </div>

        {/* ================= RIGHT: sidebar ================= */}
        <div className="hidden lg:flex flex-col w-[300px] shrink-0">
          <div className="bg-white rounded-lg shadow p-[20px] flex flex-col gap-[18px]">
            <div className="flex justify-between">
              <div>
                <div className="text-[18px] font-semibold">Profile language</div>
                <div className="text-[14px] text-gray-500">English</div>
              </div>
              {isOwnProfile && (
                <MdEdit className="w-[20px] h-[20px] text-gray-600" />
              )}
            </div>
            <hr />
            <div className="flex justify-between">
              <div>
                <div className="text-[18px] font-semibold">Public profile & URL</div>
                <div className="text-[14px] text-gray-500 break-all">
                  www.linkedin.com/in/{profileData?.userName}
                </div>
              </div>
              {isOwnProfile && (
                <MdEdit className="w-[20px] h-[20px] text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;