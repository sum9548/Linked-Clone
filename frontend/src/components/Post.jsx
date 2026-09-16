import React, { useContext } from "react";
import dp from "../assets/dp.png";
import { userDataContext } from "../context/UserContext";
import moment from "moment";
import { useState } from "react";
import { BiLike } from "react-icons/bi";
import { FaRegCommentDots } from "react-icons/fa";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { useEffect } from "react";
import { BiSolidLike } from "react-icons/bi";
import { LuSendHorizontal } from "react-icons/lu";
import { io } from "socket.io-client";
import ConnectionButton from "./ConnectionButton";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:8000");

const Post = ({ id, author, like, comment, description, image, createdAt }) => {
  const navigate = useNavigate();

  const [more, setMore] = useState(false);
  const { serverUrl } = useContext(authDataContext);
  const { userData, setEdit, getPost, handleGetProfile } =
    useContext(userDataContext);

  const [likes, setLikes] = useState(like || []);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState(comment || []);

  const [showComment, setShowComment] = useState(false);

  const handleLike = async () => {
    try {
      const result = await axios.get(serverUrl + `/api/post/like/${id}`, {
        withCredentials: true,
      });
      setLikes(result.data.like);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post(
        serverUrl + `/api/post/comment/${id}`,
        {
          content: commentContent,
        },
        {
          withCredentials: true,
        },
      );
      setComments(result.data.comment);
      console.log(result.data.comment);
      setCommentContent("");
    } catch (error) {
      console.log(error);
    }
  };

  // for likes
  useEffect(() => {
    const handleLikeUpdated = ({ postId, likes }) => {
      if (postId === id) {
        setLikes(likes);
      }
    };

    socket.on("likeUpdated", handleLikeUpdated);

    return () => {
      socket.off("likeUpdated", handleLikeUpdated);
    };
  }, [id]);

  // for comment
  useEffect(() => {
    const handleCommentUpdated = ({ postId, comm }) => {
      if (postId === id) {
        setComments(comm);
      }
    };

    socket.on("commentAdded", handleCommentUpdated);

    return () => {
      socket.off("commentAdded", handleCommentUpdated);
    };
  }, [id]);

  useEffect(() => {
    getPost();
  }, [likes, setLikes, comments]);

  return (
    <div className="w-full min-h-[200px] bg-white rounded-lg shadow-lg p-[20px] flex flex-col gap-[10px]">
      <div className="flex justify-between items-center">
        {/* Profile Image */}
        <div
          className="flex justify-center items-start gap-[10px] cursor-pointer"
          onClick={() => {
            console.log("AUTHOR:", author);
            console.log("USERNAME:", author?.userName);

            // if (userData?._id === author?._id) {
            //   navigate("/profile");
            // } else {
            //   handleGetProfile(author?.userName);
            // }

            if (author?.userName) {
              handleGetProfile(author.userName);
            }
          }}
        >
          <div
            className="
            w-[70px]
            h-[70px]
            rounded-full
            overflow-hidden
            flex
            items-center
            justify-center
            flex-shrink-0
          "
          >
            <img
              src={author?.profileImage || dp}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-[24px] font-bold">
              {author?.firstName} {author?.lastName}
            </h2>

            <div className="text-[16px] text-gray-500">
              {author?.headline || "No headline added"}
            </div>

            <div className="text-[16px] text-gray-500">
              {moment(createdAt).fromNow()}
            </div>
          </div>
        </div>

        {/* button */}

        <div>
          {userData._id != author._id && (
            <ConnectionButton userId={author._id} />
          )}
        </div>
      </div>
      <div
        className={`w-full ${
          !more ? "max-h-[100px] overflow-hidden" : ""
        } pl-[50px]`}
      >
        {description}
      </div>

      {description?.length > 150 && (
        <div
          className="pl-[50px] text-[19px] text-gray-400 cursor-pointer"
          onClick={() => setMore((prev) => !prev)}
        >
          {more ? "read less..." : "read more..."}
        </div>
      )}
      <div>
        {image && (
          <div className="w-full h-[300px] overflow-hidden flex justify-centern rounded-lg">
            <img src={image} alt="" className="rounded-lg w-full" />
          </div>
        )}

        <div>
          {/* count of  likes and comment */}
          <div className="w-full flex justify-between items-center p-[20px] border-b-2 border-gray-500">
            <div className="flex items-center justify-center gap-[5px] text-[18px]">
              <BiLike className="text-[#1ebbff] w-[22px] h-[22px]" />
              <span>{likes.length}</span>
            </div>
            <div
              className="flex items-center justify-center gap-[5px] text-[18px] cursor-pointer"
              onClick={() => setShowComment((prev) => !prev)}
            >
              <span>{comments.length}</span>
              <span>comments</span>
            </div>
          </div>

          {/*  like and comment */}
          <div className="flex  items-center w-full p-[20px] gap-[20px]">
            {!likes.includes(userData._id) && (
              <div
                className="flex justify-center items-center gap-[5px] cursor-pointer"
                onClick={handleLike}
              >
                <BiLike className=" w-[24px] h-[24px]" />
                <span>Like</span>
              </div>
            )}

            {likes.includes(userData._id) && (
              <div
                className="flex justify-center items-center gap-[5px] cursor-pointer"
                onClick={handleLike}
              >
                <BiSolidLike className=" text-[#07a4ff] w-[24px] h-[24px]" />
                <span className="text-[#07a4ff] font-semibold">Liked</span>
              </div>
            )}

            <div
              className="flex justify-center items-center gap-[5px] cursor-pointer"
              onClick={() => setShowComment((prev) => !prev)}
            >
              <FaRegCommentDots className="w-[24px] h-[24px]" />
              <span>Comment</span>
            </div>
          </div>

          {/* show comment div  */}
          {showComment && (
            <div>
              <form
                className="w-full flex justify-between items-center border-b-gray-300 border-b-2 p-[10px]"
                onSubmit={handleComment}
              >
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={"leave a comment..."}
                  className="outline-none  border-none"
                />
                <button>
                  <LuSendHorizontal className="text-[#07a4ff] w-[24px] h-[24px]" />
                </button>
              </form>
              <div className="flex flex-col">
                {comments.map((com) => (
                  <div
                    key={com._id}
                    className="w-full py-[10px] border-b border-gray-300"
                  >
                    {/* Profile + Name */}
                    <div className="flex items-center gap-[10px]">
                      {/* Profile image */}
                      <div
                        className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                       
                      >
                        <img
                          src={com.user?.profileImage || dp}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Name */}

                      <div>
                        <h2 className="text-[15px] font-semibold">
                          {com.user?.firstName} {com.user?.lastName}
                        </h2>
                        <div>{moment(com.createdAt).fromNow()}</div>
                      </div>
                    </div>

                    {/* Comment content */}
                    <div className="ml-[50px] mt-[3px] text-[14px] text-gray-700">
                      {com.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
