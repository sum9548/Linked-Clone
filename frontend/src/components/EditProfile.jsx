import React, { useContext, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { userDataContext } from "../context/UserContext";
import dp from "../assets/dp.png";
import { FiPlus } from "react-icons/fi";
import { FiCamera } from "react-icons/fi";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";

const EditProfile = () => {
  const { edit, setEdit, userData, setUserData } = useContext(userDataContext);

  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [userName, setUserName] = useState(userData.userName || "");
  const [headline, setHeadline] = useState(userData.headline || "");
  const [location, setLocation] = useState(userData.location || "");
  const [gender, setGender] = useState(userData.gender || "");
  const [skills, setSkills] = useState(userData.skills || []);
  const [newSkills, setNewSkills] = useState("");
  const [saving, setSaving] = useState(false);
  const [educations, setEducations] = useState(userData.education || []);
  const [newEducation, setNewEducation] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
  });

  const [experience, setExperience] = useState(userData.experience || []);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    description: "",
  });

  const [frontendProfileImage, setFrontendProfileImage] = useState(
    userData.profileImage || dp,
  );
  const [backenddProfileImage, setBackendProfileImage] = useState(null);

  const [frontendCoverImage, setFrontendCoverImage] = useState(
    userData.coverImage || null,
  );
  const [backendCoverImage, setBackendCoverImage] = useState(null);

  const profileImage = useRef();
  const coverImage = useRef();

  const { serverUrl } = useContext(authDataContext);

  // const addSkill = (e) => {
  //   e.preventDefault();
  //   const skill = newSkills.trim();

  //   if (skill !== "" && !skills.includes(newSkills)) {
  //     setSkills((prev) => [...prev, skill]);
  //   }
  //   setNewSkills("");
  // };

  const addSkill = (e) => {
    e.preventDefault();

    const list = newSkills
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const unique = list.filter((item) => !skills.includes(item));

    setSkills((prev) => [...prev, ...unique]);

    setNewSkills("");
  };

  const removeSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    }
  };

  // const addEducation = (e) => {
  //   e.preventDefault();

  //   if (
  //     newEducation.college.trim() !== "" &&
  //     newEducation.degree.trim() !== "" &&
  //     newEducation.fieldOfStudy.trim() !== ""
  //   ) {
  //     setEducations((prev) => [...prev, newEducation]);
  //   }
  //   setNewEducation({
  //     college: "",
  //     degree: "",
  //     fieldOfStudy: "",
  //   });
  // };
const addEducation = (e) => {
  e.preventDefault();

  if (
    !newEducation.college.trim() ||
    !newEducation.degree.trim() ||
    !newEducation.fieldOfStudy.trim()
  ) {
    return;
  }

  const updated = [
    ...educations,
    {
      college: newEducation.college,
      degree: newEducation.degree,
      fieldOfStudy: newEducation.fieldOfStudy,
    },
  ];

  console.log(updated);

  setEducations(updated);

  setNewEducation({
    college: "",
    degree: "",
    fieldOfStudy: "",
  });
};
  const removeEducation = (educ) => {
    if (educations.includes(educ)) {
      setEducations(educations.filter((e) => e !== educ));
    }
  };

  // const addExperience = (e) => {
  //   e.preventDefault();
  //   if (
  //     newExperience.title.trim() !== "" &&
  //     newExperience.company.trim() !== "" &&
  //     newExperience.description.trim() !== ""
  //   ) {
  //     setExperience((prev) => [...prev, newExperience]);
  //   }
  //   setNewExperience({
  //     title: "",
  //     company: "",
  //     description: "",
  //   });
  // };
 const addExperience = (e) => {
  e.preventDefault();

  if (
    !newExperience.title.trim() ||
    !newExperience.company.trim() ||
    !newExperience.description.trim()
  ) {
    return;
  }

  const updated = [
    ...experience,
    {
      title: newExperience.title,
      company: newExperience.company,
      description: newExperience.description,
    },
  ];

  console.log(updated);

  setExperience(updated);

  setNewExperience({
    title: "",
    company: "",
    description: "",
  });
};

  const removeExperience = (exp) => {
    if (experience.includes(exp)) {
      setExperience(experience.filter((ex) => ex !== exp));
    }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    setBackendProfileImage(file);
    setFrontendProfileImage(URL.createObjectURL(file));
  };
  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    setBackendCoverImage(file);
    setFrontendCoverImage(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      console.log("Skills", skills);
      console.log("Education", educations);
      console.log("Experience", experience);

      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("userName", userName);
      formData.append("headline", headline);
      formData.append("location", location);
      formData.append("gender", gender);

      formData.append("skills", JSON.stringify(skills));
      formData.append("education", JSON.stringify(educations));
      formData.append("experience", JSON.stringify(experience));

      if (backenddProfileImage) {
        formData.append("profileImage", backenddProfileImage);
      }

      if (backendCoverImage) {
        formData.append("coverImage", backendCoverImage);
      }

      const result = await axios.put(
        `${serverUrl}/api/user/updateprofile`,
        formData,
        {
          withCredentials: true,
        },
      );

      setUserData(result.data);
      console.log(result.data);
      console.log(userData);
      setEdit(false);
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-[100vh] fixed top-0 z-[100] flex justify-center items-center ">
      {/* send file to ref (that  handle DOM) */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={profileImage}
        onChange={handleProfileImage}
      />
      <input
        type="file"
        accept="image/*"
        hidden
        ref={coverImage}
        onChange={handleCoverImage}
      />

      <div className="w-full h-full  bg-black opacity-[0.5] absolute top-0 left-0"></div>
      <div className="w-[90%] max-w-[500px] h-[600px] bg-white relative z-[200] shadow-lg rounded-lg p-[10px] overflow-auto ">
        <div
          className="absolute top-[20px] right-[20px] cursor-pointer "
          onClick={() => {
            setEdit(false);
          }}
        >
          <RxCross1 className="w-[25px] h-[25px] text-gray-700 font-bold" />
        </div>

        {/* {cover image} */}
        <div
          className="w-full h-[150px] bg-gray-500 rounded-lg mt-[40px] overflow-hidden cursor-pointer "
          onClick={() => coverImage.current.click()}
        >
          <img src={frontendCoverImage} alt="" className="w-full" />
          <FiCamera className="absolute right-[20px] text-white top-[60px] w-[28px] h-[28px] text-gray-800 " />
        </div>

        {/* {profile image} */}
        <div
          className="w-21 h-21 rounded-full overflow-hidden absolute top-[150px] ml-[20px] cursor-pointer "
          onClick={() => profileImage.current.click()}
        >
          <img
            src={frontendProfileImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="w-[25px] h-[25px] bg-[#17b7f1] absolute left-[90px] top-[195px] ml-[5px] rounded-full flex justify-center items-center"
          onClick={() => profileImage.current?.click()}
        >
          <FiPlus className=" cursor-pointer  text-white font-semibold" />
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-[20px] mt-[45px]">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Gender (male/female/other) "
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[18px] border-2 rounded-lg"
          />
          {/* { skills} */}
          <div className="w-full p-[10px] border-2 border-gray-600 flex flex-col itc gap-[10px] rounded-lg ">
            <h1 className="text-[19px] font-semibold">Skills</h1>
            {skills && (
              <div className="flex flex-col gap-[10px] ">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="w-full h-[40px] border-[1px] border-gray-600 bg-gray-200 p-[10px] flex items-center justify-between"
                  >
                    <span>{skill}</span>
                    <RxCross1
                      className="w-[15px] h-[15px] text-gray-700 font-bold cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap0[10px] items-start ">
              <input
                type="text"
                placeholder="Add new skill..."
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <button
                className="w-full h-10 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 mt-[12px] mb-[3px] cursor-pointer"
                onClick={addSkill}
              >
                Add
              </button>
            </div>
          </div>
          {/* {education} */}
          <div className="w-full p-[10px] border-2 border-gray-600 flex flex-col itc gap-[10px] rounded-lg ">
            <h1 className="text-[19px] font-semibold">Education</h1>
            {educations && (
              <div className="flex flex-col gap-[10px] ">
                {educations.map((educ, index) => (
                  <div
                    key={index}
                    className="w-full border-[1px] border-gray-600 bg-gray-200 p-[10px] flex items-center justify-between"
                  >
                    <div>
                      <div>
                        <span className="font-semibold text-gray-800 ">
                          College :
                        </span>{" "}
                        <span className="text-gray-500">{educ.college}</span>
                      </div>
                      <div>
                        <span className="font-semibold  text-gray-800">
                          Degree :
                        </span>{" "}
                        <span className="text-gray-500">{educ.degree}</span>
                      </div>
                      <div>
                        <span className="font-semibold  text-gray-800">
                          Field Of Study :
                        </span>{" "}
                        <span className="text-gray-500">
                          {educ.fieldOfStudy}
                        </span>
                      </div>
                    </div>

                    <RxCross1
                      className="w-[15px] h-[15px] text-gray-700 font-bold cursor-pointer"
                      onClick={() => removeEducation(educ)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-[10px] items-start ">
              <input
                type="text"
                placeholder="College Name"
                value={newEducation.college}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, college: e.target.value })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <input
                type="text"
                placeholder="Degree "
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, degree: e.target.value })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <input
                type="text"
                placeholder="Field Of Study"
                value={newEducation.fieldOfStudy}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    fieldOfStudy: e.target.value,
                  })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <button
                type="button"
                className="w-full h-10 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 mt-[12px] mb-[3px] cursor-pointer"
                onClick={addEducation}
              >
                Add
              </button>
            </div>
          </div>
          {/* {experience} */}
          <div className="w-full p-[10px] border-2 border-gray-600 flex flex-col itc gap-[10px] rounded-lg ">
            <h1 className="text-[19px] font-semibold">Experience</h1>
            {experience && (
              <div className="flex flex-col gap-[10px] ">
                {experience.map((exp, index) => (
                  <div
                    key={index}
                    className="w-full border-[1px] border-gray-600 bg-gray-200 p-[10px] flex items-center justify-between"
                  >
                    <div>
                      <div>
                        <span className="font-semibold text-gray-800 ">
                          Title :
                        </span>{" "}
                        <span className="text-gray-500">{exp.title}</span>{" "}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 ">
                          Company :
                        </span>{" "}
                        <span className="text-gray-500">{exp.company}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 ">
                          Description :{" "}
                        </span>
                        <span className="text-gray-500">{exp.description}</span>
                      </div>
                    </div>

                    <RxCross1
                      className="w-[15px] h-[15px] text-gray-700 font-bold cursor-pointer"
                      onClick={() => removeExperience(exp)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-[10px] items-start ">
              <input
                type="text"
                placeholder="Title"
                value={newExperience.title}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, title: e.target.value })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <input
                type="text"
                placeholder="Company "
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <input
                type="text"
                placeholder="Description"
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    description: e.target.value,
                  })
                }
                className="w-full h-[50px] outline-none border-gray-600 px-[10px] py-[5px] text-[16px] border-2 rounded-lg "
              />
              <button
                type="button"
                className="w-full h-10 rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 mt-[12px] mb-[3px] cursor-pointer"
                onClick={addExperience}
              >
                Add
              </button>
            </div>
          </div>

          {/* save profile button */}

          <button
            className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
            disabled={saving}
            onClick={() => handleSaveProfile()}
          >
            {saving ? "saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
