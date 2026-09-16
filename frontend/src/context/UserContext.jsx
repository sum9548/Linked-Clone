import React, { createContext } from "react";
import { useContext } from "react";
import { useState } from "react";
import { authDataContext } from "./AuthContext";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const userDataContext = createContext();

const UserContext = ({ children }) => {

  const navigate = useNavigate()

  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null)

  const { serverUrl } = useContext(authDataContext);
  const [edit, setEdit] = useState(false);

  const [postData, setPostData] = useState([])


  const getCurrentUser = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/user/currentuser", {
        withCredentials: true,
      });
      setUserData(result.data);
      // console.log(result.data);
    } catch (error) {
      setUserData(null);
      console.log(error.response?.data || error.message);
    }
  };

// ============================

const getPost = async ()  =>{
  try {
    const result =await axios.get(serverUrl + "/api/post/getpost",
      {withCredentials:true})
      // console.log(result)
      setPostData(result.data)
  } catch (error) {
    console.log(error)
  }
}

const handleGetProfile = async (userName) =>{

  try {
    const result =await axios.get(serverUrl + `/api/user/profile/${userName}`,
      {withCredentials:true})
      console.log("selected profile ",result.data)
      setProfileData(result.data)
      navigate(`/profile/${userName}`)
  } catch (error) {
    console.log(error.response?.data || error.message)
  }

}

  useEffect(() => {
    getCurrentUser();
    getPost();
  }, []);

  const value = {
    userData,
    setUserData,
    edit,
    setEdit,
    postData,
    setPostData,
    getPost,
    handleGetProfile,
    profileData,
    setProfileData
  };

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
};
export default UserContext;
