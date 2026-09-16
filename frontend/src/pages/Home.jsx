import React, { useContext, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import dp from "../assets/dp.png";

import { FiPlus, FiCamera } from "react-icons/fi";
import { HiPencil } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { BsImage } from "react-icons/bs";

import { userDataContext } from "../context/UserContext";
import EditProfile from "../components/EditProfile";

import { authDataContext } from "../context/AuthContext";
import axios from "axios";

import Post from "../components/Post";

const Home = () => {
  const { userData, edit, setEdit, postData, setPostData, handleGetProfile } =
    useContext(userDataContext);

  const { serverUrl } = useContext(authDataContext);

  // =========================
  // POST STATES
  // =========================
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState("");
  const [description, setDescription] = useState("");
  const [uploadPost, setUploadPost] = useState(false);
  const [posting, setPosting] = useState(false);

  const [suggestedUser, setSuggestedUser] = useState([]);

  const image = useRef(null);

  // =========================
  // SELECT IMAGE
  // =========================
  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // =========================
  // CREATE POST
  // =========================
  const handleUploadPost = async () => {
    if (!description.trim() && !backendImage) {
      alert("Please write something or select an image.");
      return;
    }

    setPosting(true);

    try {
      const formData = new FormData();

      formData.append("description", description);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/post/create`,
        formData,
        {
          withCredentials: true,
        },
      );

      console.log("POST CREATED:", result.data);

      // Add new post at the beginning
      setPostData((prev) => [result.data, ...prev]);

      // Clear form
      setDescription("");
      setBackendImage("");
      setFrontendImage("");

      // Close popup
      setUploadPost(false);
    } catch (error) {
      console.log("POST ERROR:", error.response?.data || error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleSuggestedUsers = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/user/suggestedusers", {
        withCredentials: true,
      });
      setSuggestedUser(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSuggestedUsers();
  }, []);

  // console.log("post data: ",postData)
  return (
    <div className="w-full min-h-screen bg-[#f3f2ef] relative">
      {/* =========================
          EDIT PROFILE
      ========================= */}
      {edit && <EditProfile />}

      {/* =========================
          NAVBAR
      ========================= */}
      <Nav />

      {/* =========================
          MAIN CONTAINER
      ========================= */}
      <div
        className="
          max-w-7xl
          mx-auto
          pt-[100px]
          px-4
          flex
          flex-col
          lg:flex-row
          gap-5
          items-start
        "
      >
        {/* =====================================================
            LEFT SIDEBAR
        ====================================================== */}

        <div
          className="
            w-full
            lg:w-[23%]
            bg-white
            rounded-lg
            shadow-lg
            p-[10px]
            relative
          "
        >
          {/* COVER IMAGE */}
          <div
            className="
              w-full
              h-[100px]
              bg-gray-400
              rounded
              overflow-hidden
              flex
              items-center
              justify-center
              cursor-pointer
              relative
            "
            onClick={() => setEdit(true)}
          >
            {userData?.coverImage && (
              <img
                src={userData.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}

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
          </div>

          {/* PROFILE IMAGE */}
          <div
            className="
              w-[70px]
              h-[70px]
              rounded-full
              overflow-hidden
              flex
              items-center
              justify-center
              absolute
              top-[65px]
              left-[35px]
              cursor-pointer
              bg-gray-200
            "
            onClick={() => setEdit(true)}
          >
            <img
              src={userData?.profileImage || dp}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* PLUS BUTTON */}
          <div
            className="
              w-[20px]
              h-[20px]
              bg-[#17b7f1]
              absolute
              left-[90px]
              top-[105px]
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

          {/* USER INFORMATION */}
          <div
            className="
              mt-[30px]
              pl-[20px]
              text-lg
              font-semibold
              text-gray-700
            "
          >
            {/* NAME */}
            <div className="text-[20px] text-gray-700">
              {userData?.firstName} {userData?.lastName}
            </div>

            {/* HEADLINE */}
            <div className="text-[16px] text-gray-500">
              {userData?.headline || ""}
            </div>

            {/* LOCATION */}
            <div className="text-[16px] text-gray-500">
              {userData?.location || ""}
            </div>

            {/* SKILLS */}
            {userData?.skills?.length > 0 && (
              <div className="mt-3">
                <h3 className="font-semibold text-gray-700 text-sm">Skills</h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="
                        px-2
                        py-1
                        bg-blue-100
                        text-blue-700
                        rounded-full
                        text-xs
                      "
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* EDIT PROFILE BUTTON */}
          <button
            className="
              w-full
              h-10
              mt-[50px]
              my-[20px]
              rounded-full
              border-2
              border-blue-500
              text-blue-500
              hover:bg-blue-50
              flex
              items-center
              justify-center
              gap-[15px]
            "
            onClick={() => setEdit(true)}
          >
            Edit Profile
            <HiPencil className="w-[20px] h-[20px]" />
          </button>
        </div>

        {/* =====================================================
            MIDDLE SECTION
        ====================================================== */}

        <div
          className="
            w-full
            lg:w-[54%]
            bg-[#f3f2ef]
            flex
            flex-col
            gap-[20px]
          "
        >
          {/* =========================
              START A POST
          ========================= */}

          <div
            className="
              w-full
              h-[120px]
              bg-white
              shadow-lg
              rounded-lg
              flex
              justify-center
              items-center
              gap-[10px]
              p-4
            "
          >
            {/* PROFILE IMAGE */}

            <div
              className="
                w-[70px]
                h-[70px]
                rounded-full
                overflow-hidden
                flex
                items-center
                justify-center
                cursor-pointer
                flex-shrink-0
              "
              onClick={() => setEdit(true)}
            >
              <img
                src={userData?.profileImage || dp}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* START A POST BUTTON */}

            <button
              className="
                w-[80%]
                h-[60px]
                border-2
                rounded-full
                border-gray-500
                flex
                items-center
                justify-start
                px-[20px]
                cursor-pointer
                hover:bg-gray-200
                text-gray-600
              "
              onClick={() => setUploadPost(true)}
            >
              Start a post
            </button>
          </div>

          {/* =========================
              POSTS
          ========================= */}

          {postData?.map((post, index) => (
            <Post
              key={post._id || index}
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

        <div></div>

        {/* =====================================================
            RIGHT SIDEBAR
        ====================================================== */}

        <div
          className="
            w-full
            lg:w-[23%]
            bg-white
            rounded-lg
            shadow-lg
            min-h-[280px]
            p-5
            "
        >
          <h1 className="text-[20px] text-gray-600 font-semibold ">
            Suggested Users
          </h1>
          {suggestedUser.length > 0 ? (
            <div className="flex flex-col gap-[10px] mt-[20px]">
              {suggestedUser.map((suguser, i) => (
                <div
                  key={suguser._id || i}
                  className="flex items-start gap-[10px] mt-[10px] cursor-pointer hover:bg-gray-200 rounded-lg p-[8px] min-h-[65px] "
                  onClick={() => handleGetProfile(suguser.userName)}
                >
                  <div className="w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    <img
                      src={suguser.profileImage || dp}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* USER INFORMATION */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[14px] font-semibold text-gray-700 truncate">
                      {suguser.firstName} {suguser.lastName}
                    </h2>

                    <p className="text-[12px] font-medium text-gray-500 min-h-[30px]">
                      {suguser.headline || "No headline added"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
        <div className="mt-[20px] text-gray-500">
          No Suggested Users
        </div>
         )}
         </div>
      </div>
      {/* =====================================================
          CREATE POST POPUP
      ====================================================== */}

      {uploadPost && (
        <div
          className="
            fixed
            inset-0
            bg-black/60
            z-[100]
            flex
            items-center
            justify-center
          "
        >
          {/* POPUP */}

          <div
            className="
              relative
              w-[90%]
              max-w-[500px]
              h-[600px]
              bg-white
              rounded-lg
              shadow-xl
              flex
              flex-col
              p-5
            "
          >
            {/* =========================
                POPUP HEADER
            ========================= */}

            <div className="flex items-center gap-3">
              {/* PROFILE IMAGE */}

              <div
                className="
                  w-[60px]
                  h-[60px]
                  rounded-full
                  overflow-hidden
                "
              >
                <img
                  src={userData?.profileImage || dp}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* USER NAME */}

              <h2 className="text-xl font-semibold">
                {userData?.firstName} {userData?.lastName}
              </h2>

              {/* CLOSE BUTTON */}

              <button
                onClick={() => setUploadPost(false)}
                className="
                  absolute
                  top-5
                  right-5
                "
              >
                <RxCross1
                  className="
                    text-2xl
                    text-gray-600
                    cursor-pointer
                  "
                />
              </button>
            </div>

            {/* =========================
                TEXTAREA
            ========================= */}

            <textarea
              className={`
                w-full
                ${frontendImage ? "h-[200px]" : "h-[550px]"}
                outline-none
                border-none
                p-[10px]
                resize-none
                text-[18px]
                overflow-y-auto
              `}
              placeholder="What do you want to talk about..?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {/* =========================
                IMAGE PREVIEW
            ========================= */}

            {frontendImage && (
              <div
                className="
                  w-full
                  h-[200px]
                  rounded-lg
                  overflow-hidden
                  flex
                  items-center
                  justify-center
                  mb-3
                "
              >
                <img
                  src={frontendImage}
                  alt="Preview"
                  className="
                    w-full
                    h-full
                    object-cover
                    rounded-lg
                  "
                />
              </div>
            )}

            {/* =========================
                HIDDEN FILE INPUT
            ========================= */}

            <input
              type="file"
              accept="image/*"
              ref={image}
              hidden
              onChange={handleImage}
            />

            {/* =========================
                FOOTER
            ========================= */}

            <div
              className="
                border-t
                pt-4
                flex
                items-center
                justify-between
              "
            >
              {/* IMAGE ICON */}

              <div
                className="cursor-pointer"
                onClick={() => image.current?.click()}
              >
                <BsImage
                  className="
                    text-2xl
                    text-gray-600
                    hover:text-blue-600
                  "
                />
              </div>

              {/* POST BUTTON */}

              <button
                disabled={posting}
                className="
                  px-8
                  py-2
                  rounded-full
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-gray-400
                  text-white
                  font-semibold
                "
                onClick={handleUploadPost}
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
