import React, { useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import dp from "../assets/dp.png";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";

const Network = () => {
  const { serverUrl } = useContext(authDataContext);
  const [connections, setConnections] = useState([]);

  const handleGetRequests = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/connection/requests`, {
        withCredentials: true,
      });
      setConnections(result?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAcceptConnection = async (requestId) => {
    try {
      const result = await axios.put(
        `${serverUrl}/api/connection/accept/${requestId}`,
        {},
        { withCredentials: true },
      );

      console.log("Accept response:", result.data);

      // Remove the request from the invitations list
      setConnections((prev) =>
        prev.filter((connection) => connection._id !== requestId),
      );
    } catch (error) {
      console.log("Accept error:", error.response?.data);
    }
  };

  const handleRejectConnection = async (requestId) => {
    try {
      await axios.put(
        `${serverUrl}/api/connection/reject/${requestId}`,
        {},
        {
          withCredentials: true,
        },
      );

      setConnections((prev) =>
        prev.filter((connection) => connection._id !== requestId),
      );
    } catch (error) {
      console.log("Reject error:", error.response?.data || error.message);
    }
  };
  useEffect(() => {
    handleGetRequests();
  }, []);

  return (
    <div className="w-screen h-[100vh] bg-[#f3f2ef] pt-[100px] px-[20px] flex flex-col r items-center gap-[40px]">
      <Nav />
      <div className="w-full h-[100px] bg-white shadow-lg rounded-lg flex items-center p-[10px] text-[22px] text-gray-600">
        Invitations {connections.length}
      </div>

      {connections.length > 0 && (
        <div className="w-[100%] max-w-[700px] flex flex-col gap-[20px]">
          {connections.map((connection) => (
            <div
              key={connection._id}
              className="w-full min-h-[100px] bg-white shadow-lg rounded-lg p-[20px] flex justify-between items-center"
            >
              {/* LEFT SIDE */}
              <div className="flex items-center gap-[20px]">
                {/* Profile Image */}
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden cursor-pointer">
                  <img
                    src={connection.sender?.profileImage || dp}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <div className="text-[19px] font-semibold text-gray-700">
                  {connection.sender?.firstName} {connection.sender?.lastName}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex gap-[10px]">
                <button
                  className=" text-blue-500 font-semibold"
                  onClick={() => handleAcceptConnection(connection._id)}
                >
                  <IoCheckmarkCircleOutline className="w-[48px] h-[48px]" />
                </button>

                <button
                  className=" text-red-500 font-semibold"
                  onClick={() => handleRejectConnection(connection._id)}
                >
                  <RxCrossCircled className=" w-[45px] h-[45px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Network;
