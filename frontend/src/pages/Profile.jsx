import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import dp from "../assets/dp.png";

import { FiPlus, FiCamera } from "react-icons/fi";
import { HiPencil } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import EditProfile from "../components/EditProfile";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import Post from "../components/Post";
import ConnectionButton from "../components/ConnectionButton";

const Profile = () => {
  const { userData, edit, setEdit, postData, profileData, setProfileData } =
    useContext(userDataContext);

  const { userName } = useParams();

  const profileUserName = userName || userData?.userName;

  const { serverUrl } = useContext(authDataContext);
  const [profilePost, setProfilePost] = useState([]);
  const [userConnection, setUserConnection] = useState([]);

  // GET SELECTED USER PROFILE
  useEffect(() => {
    const getProfile = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/profile/${profileUserName}`,
          {
            withCredentials: true,
          },
        );

        console.log("PROFILE DATA:", result.data);
        setProfileData(result.data);
      } catch (error) {
        console.log("Profile error:", error.response?.data || error.message);
      }
    };

    if (profileUserName) {
      getProfile();
    }
  }, [profileUserName, serverUrl, setProfileData]);

  // Check whether the profile being viewed belongs to logged-in user
  const isMyProfile =
    userData?._id && profileData?._id
      ? userData._id === profileData._id
      : false;

  // ----------------------------------------
  // GET CONNECTIONS
  // ----------------------------------------
  const handleGetUserConnection = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/connection`, {
        withCredentials: true,
      });

      setUserConnection(result.data || []);
    } catch (error) {
      console.log("Get connection error:", error);
    }
  };

  // ----------------------------------------
  // GET CONNECTIONS ON PAGE LOAD
  // ----------------------------------------
  useEffect(() => {
    handleGetUserConnection();
  }, []);

  // ----------------------------------------
  // GET POSTS OF CURRENT PROFILE USER
  // ----------------------------------------
  useEffect(() => {
    if (!profileData?._id || !Array.isArray(postData)) {
      setProfilePost([]);
      return;
    }

    const posts = postData.filter(
      (post) => post.author?._id === profileData._id,
    );

    setProfilePost(posts);
  }, [profileData, postData]);

  // ----------------------------------------
  // IF PROFILE DATA IS NOT AVAILABLE
  // ----------------------------------------
  if (!profileData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center pt-[100px] bg-[#f3f2ef]">
        <Nav />

        <div className="w-full max-w-[900px] bg-white rounded-lg shadow-lg p-10 text-center">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100vh] flex flex-col items-center pt-[100px] pb-[40px] bg-[#f3f2ef]">
      <Nav />

      {/* Only show EditProfile for MY profile */}
      {edit && isMyProfile && <EditProfile />}

      <div className="w-full max-w-[900px] min-h-[100vh] flex flex-col gap-[10px]">
        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <div className="relative bg-white pb-[40px] rounded-lg shadow-lg">
          {/* COVER IMAGE */}
          <div
            className={`
              w-full
              h-[200px]
              bg-gray-400
              rounded-t-lg
              overflow-hidden
              flex
              items-center
              justify-center
              relative
              ${isMyProfile ? "cursor-pointer" : ""}
            `}
            onClick={() => {
              if (isMyProfile) {
                setEdit(true);
              }
            }}
          >
            {profileData?.coverImage ? (
              <img
                src={profileData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-lg">No cover image</div>
            )}

            {/* Camera only for own profile */}
            {isMyProfile && (
              <FiCamera
                className="
                  absolute
                  right-[20px]
                  top-[20px]
                  w-[25px]
                  h-[25px]
                  text-white
                "
              />
            )}
          </div>

          {/* PROFILE IMAGE */}
          <div
            className={`
              w-[100px]
              h-[100px]
              rounded-full
              overflow-hidden
              flex
              items-center
              justify-center
              absolute
              top-[150px]
              left-[35px]
              bg-gray-200
              border-4
              border-white
              ${isMyProfile ? "cursor-pointer" : ""}
            `}
            onClick={() => {
              if (isMyProfile) {
                setEdit(true);
              }
            }}
          >
            <img
              src={profileData?.profileImage || dp}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* PLUS BUTTON ONLY FOR MY PROFILE */}
          {isMyProfile && (
            <div
              className="
                w-[25px]
                h-[25px]
                bg-[#17b7f1]
                absolute
                left-[105px]
                top-[220px]
                rounded-full
                flex
                justify-center
                items-center
                cursor-pointer
              "
              onClick={() => setEdit(true)}
            >
              <FiPlus className="text-white" />
            </div>
          )}

          {/* USER INFORMATION */}
          <div className="mt-[65px] pl-[35px] pr-[20px] text-lg font-semibold text-gray-700">
            {/* NAME */}
            <div className="text-[25px] font-bold">
              {profileData?.firstName} {profileData?.lastName}
            </div>

            {/* USERNAME */}
            {profileData?.userName && (
              <div className="text-[15px] text-gray-400">
                @{profileData.userName}
              </div>
            )}

            {/* HEADLINE */}
            <div className="text-[16px] text-gray-500 mt-1">
              {profileData?.headline || "No headline added"}
            </div>

            {/* LOCATION */}
            {profileData?.location && (
              <div className="text-[16px] text-gray-500">
                {profileData.location}
              </div>
            )}

            {/* CONNECTIONS */}
            <div className="text-[16px] text-gray-500 mt-1">
              {userConnection.length} connection
              {userConnection.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* EDIT PROFILE BUTTON ONLY FOR MY PROFILE */}
          {isMyProfile ? (
            <button
              className="
                min-w-[150px]
                h-10
                mt-[20px]
                ml-[35px]
                rounded-full
                border-2
                border-blue-500
                text-blue-500
                hover:bg-blue-50
                flex
                items-center
                cursor-pointer
                justify-center
                gap-[15px]
              "
              onClick={() => setEdit(true)}
            >
              Edit Profile
              <HiPencil className="w-[20px] h-[20px]" />
            </button>
          ) : (
            <div className="mt-[20px] ml-[35px]">
              <ConnectionButton userId={profileData._id} />
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* POSTS */}
        {/* ================================================= */}

        <div className="w-full">
          {/* TOTAL POSTS */}
          <div
            className="
              w-full
              min-h-[100px]
              flex
              items-center
              p-[20px]
              text-[22px]
              text-gray-600
              font-semibold
              bg-white
              shadow-lg
              rounded-lg
            "
          >
            Post ({profilePost.length})
          </div>

          {/* PROFILE POSTS */}
          {profilePost.length > 0 ? (
            <div className="flex flex-col gap-[10px] mt-[10px]">
              {profilePost.map((post) => (
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
          ) : (
            <div className="w-full bg-white rounded-lg shadow-lg p-[30px] mt-[10px] text-center text-gray-500">
              No posts yet.
            </div>
          )}
        </div>

        {/* ================================================= */}
        {/* SKILLS */}
        {/* ================================================= */}

        {profileData?.skills?.length > 0 && (
          <div
            className="
              w-full
              min-h-[100px]
              flex
              flex-col
              items-start
              gap-[10px]
              p-[20px]
              justify-center
              font-semibold
              bg-white
              shadow-lg
              rounded-lg
            "
          >
            <div className="text-gray-600 text-[22px]">Skills</div>

            <div className="flex flex-wrap justify-start gap-[10px] text-gray-600">
              {profileData.skills.map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="
                    px-[15px]
                    py-[8px]
                    bg-blue-100
                    text-blue-700
                    rounded-full
                  "
                >
                  {skill}
                </div>
              ))}
            </div>

            {/* Add skills only for own profile */}
            {isMyProfile && (
              <button
                className="
                  min-w-[150px]
                  h-10
                  mt-[10px]
                  rounded-full
                  border-2
                  border-blue-500
                  text-blue-500
                  hover:bg-blue-50
                  flex
                  items-center
                  cursor-pointer
                  justify-center
                "
                onClick={() => setEdit(true)}
              >
                Add Skills
              </button>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* EDUCATION */}
        {/* ================================================= */}

        {profileData?.education?.length > 0 && (
          <div
            className="
              w-full
              min-h-[100px]
              flex
              flex-col
              items-start
              gap-[10px]
              p-[20px]
              bg-white
              shadow-lg
              rounded-lg
            "
          >
            <div className="text-gray-600 text-[22px] font-semibold">
              Education
            </div>

            <div className="flex flex-col gap-[20px] text-[18px] text-gray-600">
              {profileData.education.map((educ, index) => (
                <div key={index}>
                  <div>
                    <strong>College:</strong> {educ.college}
                  </div>

                  <div>
                    <strong>Degree:</strong> {educ.degree}
                  </div>

                  <div>
                    <strong>Field Of Study:</strong> {educ.fieldOfStudy}
                  </div>
                </div>
              ))}
            </div>

            {/* Add education only for own profile */}
            {isMyProfile && (
              <button
                className="
                  min-w-[200px]
                  h-10
                  mt-[10px]
                  rounded-full
                  border-2
                  border-blue-500
                  text-blue-500
                  hover:bg-blue-50
                  flex
                  items-center
                  cursor-pointer
                  justify-center
                "
                onClick={() => setEdit(true)}
              >
                Add Education
              </button>
            )}
          </div>
        )}

        {/* ================================================= */}
        {/* EXPERIENCE */}
        {/* ================================================= */}

        {profileData?.experience?.length > 0 && (
          <div
            className="
              w-full
              min-h-[100px]
              flex
              flex-col
              items-start
              gap-[10px]
              p-[20px]
              bg-white
              shadow-lg
              rounded-lg
            "
          >
            <div className="text-gray-600 text-[22px] font-semibold">
              Experience
            </div>

            <div className="flex flex-col gap-[20px] text-[18px] text-gray-600">
              {profileData.experience.map((exp, index) => (
                <div key={index}>
                  <div>
                    <strong>Title:</strong> {exp.title}
                  </div>

                  <div>
                    <strong>Company:</strong> {exp.company}
                  </div>

                  <div>
                    <strong>Description:</strong> {exp.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Add experience only for own profile */}
            {isMyProfile && (
              <button
                className="
                  min-w-[200px]
                  h-10
                  mt-[10px]
                  rounded-full
                  border-2
                  border-blue-500
                  text-blue-500
                  hover:bg-blue-50
                  flex
                  items-center
                  cursor-pointer
                  justify-center
                "
                onClick={() => setEdit(true)}
              >
                Add Experience
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
