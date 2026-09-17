import React, { useContext, useEffect, useState } from "react";
import logo2 from "../assets/logo2.png";
import { IoSearchSharp, IoNotificationsSharp } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUserGroup } from "react-icons/fa6";
import dp from "../assets/dp.png";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const [activeSearch, setActiveSearch] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const { userData, setUserData,handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });

      setUserData(null);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

 const handleSearch = async () => {
  if (!searchInput.trim()) {
    setSearchData([]);
    return;
  }

  try {
    const result = await axios.get(
      `${serverUrl}/api/user/search?query=${encodeURIComponent(
        searchInput.trim()
      )}`,
      {
        withCredentials: true,
      }
    );

    setSearchData(result.data);
  } catch (error) {
    setSearchData([]);

    console.log(
      "Search error:",
      error.response?.data || error.message
    );
  }
};
  useEffect(() => {
   
      handleSearch();
  
  }, [searchInput]);

  return (
    <div className="w-full fixed top-0 left-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl h-[80px] mx-auto flex items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <img
            src={logo2}
            alt=""
            className="w-12 cursor-pointer"
            onClick={() => {
              setActiveSearch(false);
              navigate("/");
            }}
          />

          {!activeSearch && (
            <IoSearchSharp
              onClick={() => setActiveSearch(true)}
              className="text-2xl text-gray-600 cursor-pointer lg:hidden"
            />
          )}

          {searchData.length > 0 && (
            <div className="absolute top-[90px] left-[0px] w-full h-[450px] lg:w-[700px] lg-w-[700px] lg:left-[20px] rounded-lg bg-white min-h-[100px] shadow-lg flex flex-col gap-[20px] p-[20px] overflow-auto">
              {searchData.map((search, i) => (
                <div
                  className="flex gap-[20px] items-center p-[10px] border-b-2 border-b-gray-300  hover:bg-gray-200 cursor-pointer rounded-lg "
                  onClick={()=>handleGetProfile(search.userName)}
                  key={i}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img
                      src={search.profileImage || dp}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-700">
                      {search.firstName} {search.lastName}
                    </h2>

                    <h2 className="text-[16px] font-semibold text-gray-500">
                      {search.headline}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            className={`${
              activeSearch ? "flex" : "hidden"
            } lg:flex items-center gap-2 bg-[#f3f2ef] rounded-md px-3 h-10
            w-[150px] sm:w-[220px] md:w-[300px] lg:w-[380px] xl:w-[450px]`}
          >
            <IoSearchSharp className="text-xl text-gray-600" />

            <input
              type="text"
              value={searchInput}
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none"
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 md:gap-6 relative">
          <div className="flex flex-col items-center text-gray-600 cursor-pointer"
          onClick={() => {
              navigate("/");
            }}
          >
            <TiHome className="text-2xl" />
            <span className="hidden md:block text-sm">Home</span>
          </div>

          <div
            className="hidden md:flex flex-col items-center text-gray-600 cursor-pointer"
            onClick={() => navigate("/network")}
          >
            <FaUserGroup className="text-2xl" />
            <span className="text-sm">My Network</span>
          </div>

          <div className="flex flex-col items-center text-gray-600 cursor-pointer"
          onClick={()=>navigate("/notification")}>
            <IoNotificationsSharp className="text-2xl" />
            <span className="hidden md:block text-sm">Notifications</span>
          </div>

          {/* Profile */}
          <div
            onClick={() => setShowPopup(!showPopup)}
            className="w-11 h-11 rounded-full overflow-hidden cursor-pointer"
          >
            <img
              src={userData.profileImage || dp}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Popup */}
          {showPopup && (
            <div className="absolute right-0 top-16 w-[300px] bg-white shadow-xl rounded-lg p-5 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src={userData.profileImage || dp}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-lg font-semibold text-gray-700">
                {userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : "Loading..."}
              </h2>

              <button
                className="w-full h-10 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </button>

              <hr className="w-full" />

              <div
                className="flex items-center gap-2 w-full cursor-pointer text-gray-700"
                onClick={() => navigate("/network")}
              >
                <FaUserGroup />
                My Networks
              </div>

              <button
                onClick={handleSignOut}
                className="w-full h-10 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nav;
