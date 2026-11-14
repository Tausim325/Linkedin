import React, { useContext, useState, useRef } from "react";
import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { userDataContext } from "../Context/UserContext";
import { authDataContext } from "../Context/AuthContext";
import profile from "../assets/profile.png";
import { FiPlus } from "react-icons/fi";
import { CiCamera } from "react-icons/ci";

function EditProfile() {
  let { edit, setEdit, userData, setUserData } = useContext(userDataContext);
  let { serverUrl } = useContext(authDataContext);

  let [firstName, setFirstName] = useState(userData?.firstName || "");
  let [lastName, setLastName] = useState(userData?.lastName || "");
  let [userName, setUserName] = useState(userData?.userName || "");
  let [headline, setHeadline] = useState(userData?.headline || "");
  let [location, setLocation] = useState(userData?.location || "");
  let [gender, setGender] = useState(userData?.gender || "");

  let [skills, setSkills] = useState(userData?.skills || []);
  let [newSkills, setNewSkills] = useState("");

  let [education, setEducation] = useState(userData?.education || []);

  let [newEducation, setNewEducation] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
  });

  let [frontendProfileImage, setFrontendProfileImage] = useState(
    userData?.profileImage || profile,
  );
  let [backendProfileImage, setBackendProfileImage] = useState(null);
  let [frontendCoverImage, setFrontendCoverImage] = useState(
    userData?.coverImage || null,
  );
  let [backendCoverImage, setBackendCoverImage] = useState(null);

  let [saving, setSaving] = useState(false);

  const profileImage = useRef();
  const coverImage = useRef();

  function addSkill(e) {
    e.preventDefault();

    let skill = newSkills.trim();

    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }

    setNewSkills("");
  }

  function addEducation(e) {
    e.preventDefault();

    if (
      newEducation.college.trim() &&
      newEducation.degree.trim() &&
      newEducation.fieldOfStudy.trim()
    ) {
      setEducation([
        ...education,
        {
          college: newEducation.college.trim(),
          degree: newEducation.degree.trim(),
          fieldOfStudy: newEducation.fieldOfStudy.trim(),
        },
      ]);

      setNewEducation({
        college: "",
        degree: "",
        fieldOfStudy: "",
      });
    }
  }
  let [experience, setExperience] = useState(userData?.experience || []);

  let [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    description: "",
  });
  function addExperience(e) {
    e.preventDefault();

    if (
      newExperience.title.trim() &&
      newExperience.company.trim() &&
      newExperience.description.trim()
    ) {
      setExperience([
        ...experience,
        {
          title: newExperience.title.trim(),
          company: newExperience.company.trim(),
          description: newExperience.description.trim(),
        },
      ]);

      setNewExperience({
        title: "",
        company: "",
        description: "",
      });
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      console.log("Headline before saving:", headline);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("userName", userName);
      formData.append("headline", headline);
      formData.append("location", location);
      formData.append("gender", gender);
      formData.append("skills", JSON.stringify(skills));
      formData.append("education", JSON.stringify(education));
      formData.append("experience", JSON.stringify(experience));
      if (backendProfileImage)
        formData.append("profileImage", backendProfileImage);
      if (backendCoverImage) formData.append("coverImage", backendCoverImage);

      const result = await axios.put(
        serverUrl + "/api/user/updateprofile",
        formData,
        { withCredentials: true },
      );
      setUserData(result.data);
      setEdit(false);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  }

  function handleProfileImage(e) {
    let file = e.target.files[0];
    if (!file) return;
    setBackendProfileImage(file);
    setFrontendProfileImage(URL.createObjectURL(file));
  }
  function handleCoverImage(e) {
    let file = e.target.files[0];
    if (!file) return;
    setBackendCoverImage(file);
    setFrontendCoverImage(URL.createObjectURL(file));
  }

  return (
    <div className="w-full h-[100vh] fixed top-0 left-0 z-[100] flex justify-center items-center">
      <input
        type="file"
        accept="image/*"
        hidden
        ref={profileImage}
        onChange={handleProfileImage}
      ></input>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={coverImage}
        onChange={handleCoverImage}
      ></input>

      {/* Background Overlay */}
      <div
        className="w-full h-full bg-black opacity-[0.5] absolute top-0 left-0"
        onClick={() => setEdit(false)}
      ></div>

      {/* Edit Profile Box */}
      <div className="w-[90%] max-w-[500px] max-h-[90vh] bg-white relative z-[200] shadow-lg rounded-lg p-[10px] overflow-auto">
        {/* Close Button */}
        <div
          className="absolute top-[20px] right-[15px] cursor-pointer z-10"
          onClick={() => setEdit(false)}
        >
          <RxCross1 className="w-[25px] h-[25px] text-gray-800 font-bold" />
        </div>

        {/* Cover Image */}
        <div
          className="w-full h-[170px] bg-gray-500 rounded-lg mt-[40px] overflow-hidden relative cursor-pointer"
          onClick={() => coverImage.current.click()}
        >
          {frontendCoverImage && (
            <img
              src={frontendCoverImage}
              alt="cover"
              className="w-full h-full object-cover"
            />
          )}
          <CiCamera className="absolute right-[17px] top-[15px] text-2xl text-gray-200 cursor-pointer" />
        </div>

        {/* Profile Image */}
        <div
          className="w-[70px] h-[70px] rounded-full overflow-hidden absolute top-[190px] ml-[20px]"
          onClick={() => profileImage.current.click()}
        >
          <img
            src={frontendProfileImage}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Add Profile Image Icon */}
        <div
          className="w-[20px] h-[20px] bg-[#17c1ff] absolute top-[225px] left-[78px] rounded-full flex justify-center items-center cursor-pointer"
          onClick={() => profileImage.current.click()}
        >
          <FiPlus className="text-white" />
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-[20px] mt-[50px]">
          {/* First Name */}
          <div className="w-full flex flex-col gap-3 ">
            <input
              type="text"
              placeholder="First Name"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg font-bold"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="w-full flex flex-col gap-3">
            <h1 className="w-full text-[14px] font-semibold text-gray-800">
              Last Name
            </h1>

            <input
              type="text"
              placeholder="Last Name"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Username */}
          <div className="w-full flex flex-col gap-3">
            <h1 className="w-full text-[14px] font-semibold text-gray-800">
              Username
            </h1>

            <input
              type="text"
              placeholder="Username"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* Headline */}
          <div className="w-full flex flex-col gap-3">
            <h1 className="w-full text-[14px] font-semibold text-gray-800">
              Headline
            </h1>

            <input
              type="text"
              placeholder="Headline"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="w-full flex flex-col gap-3">
            <h1 className="w-full text-[14px] font-semibold text-gray-800">
              Location
            </h1>

            <input
              type="text"
              placeholder="Location"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="w-full flex flex-col gap-3">
            <h1 className="w-full text-[14px] font-semibold text-gray-800">
              Gender
            </h1>

            <input
              type="text"
              placeholder="Gender (male/female/other)"
              className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>

          {/* Skills Heading */}
          <h1 className="w-full text-[19px] font-semibold">Skills</h1>

          {/* Skills List */}
          {skills && (
            <div className="w-full flex flex-wrap justify-start gap-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="text-[16px] bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2"
                >
                  <span>{skill}</span>

                  {/* Cross only for Skills */}
                  <RxCross1
                    className="w-[14px] h-[14px] text-gray-800 cursor-pointer"
                    onClick={() => {
                      setSkills(skills.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add Skill Input & Button */}
          <div className="w-full flex flex-col items-center gap-3">
            <input
              type="text"
              placeholder="Add new skill"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
              className="w-full max-w-[350px] h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            <button
              type="button"
              onClick={addSkill}
              className="w-full max-w-[350px] h-[44px] rounded-full border-2 border-sky-400 text-sky-500 hover:bg-sky-400 hover:text-white transition"
            >
              Add
            </button>
          </div>

          {/* Education Heading */}
          <h1 className="w-full text-[19px] font-semibold">Education</h1>

          {/* Education List */}
          <div className="w-full flex flex-col gap-3">
            {education.map((edu, index) => (
              <div
                key={index}
                className="w-full bg-blue-100 text-blue-700 p-4 rounded-lg border border-blue-200 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{edu.college}</span>

                  <span className="text-sm">{edu.degree}</span>

                  <span className="text-sm">{edu.fieldOfStudy}</span>
                </div>

                {/* Remove Education */}
                <RxCross1
                  className="w-[14px] h-[14px] text-gray-800 cursor-pointer shrink-0"
                  onClick={() => {
                    setEducation(education.filter((_, i) => i !== index));
                  }}
                />
              </div>
            ))}
          </div>

          {/* Add Education Input & Button */}
          <div className="w-full flex flex-col items-center gap-3">
            {/* College */}
            <input
              type="text"
              placeholder="College / University"
              value={newEducation.college}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  college: e.target.value,
                })
              }
              className="w-full h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            {/* Degree */}
            <input
              type="text"
              placeholder="Degree (e.g. BCA, MCA)"
              value={newEducation.degree}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  degree: e.target.value,
                })
              }
              className="w-full h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            {/* Field of Study */}
            <input
              type="text"
              placeholder="Field of Study"
              value={newEducation.fieldOfStudy}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  fieldOfStudy: e.target.value,
                })
              }
              className="w-full h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            {/* Add Education Button */}
            <button
              type="button"
              onClick={addEducation}
              className="w-full max-w-[350px] h-[44px] rounded-full border-2 border-sky-400 text-sky-500 hover:bg-sky-400 hover:text-white transition"
            >
              Add Education
            </button>
          </div>
          {/* Experience Heading */}
          <h1 className="w-full text-[19px] font-semibold">Experience</h1>

          {/* Experience List */}
          <div className="w-full flex flex-col gap-3">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="w-full bg-blue-100 text-blue-700 p-4 rounded-lg border border-blue-200 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{exp.title}</span>

                  <span className="text-sm">{exp.company}</span>

                  <p className="text-sm whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </div>

                <RxCross1
                  className="w-[14px] h-[14px] text-gray-800 cursor-pointer shrink-0"
                  onClick={() => {
                    setExperience(experience.filter((_, i) => i !== index));
                  }}
                />
              </div>
            ))}
          </div>

          {/* Add Experience Inputs */}
          <div className="w-full flex flex-col items-center gap-3">
            <input
              type="text"
              placeholder="Title (e.g. MERN Stack Developer)"
              value={newExperience.title}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  title: e.target.value,
                })
              }
              className="w-full h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            <input
              type="text"
              placeholder="Company"
              value={newExperience.company}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  company: e.target.value,
                })
              }
              className="w-full h-[50px] outline-none border-2 border-gray-400 px-3 text-[16px] rounded-lg focus:border-sky-400"
            />

            <textarea
              placeholder="Description"
              value={newExperience.description}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  description: e.target.value,
                })
              }
              className="w-full min-h-[100px] outline-none border-2 border-gray-400 p-3 text-[16px] rounded-lg resize-y focus:border-sky-400"
            />

            <button
              type="button"
              onClick={addExperience}
              className="w-full max-w-[350px] h-[44px] rounded-full border-2 border-sky-400 text-sky-500 hover:bg-sky-400 hover:text-white transition"
            >
              Add Experience
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-[45px] rounded-full bg-sky-500 text-white font-semibold hover:bg-sky-600 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
