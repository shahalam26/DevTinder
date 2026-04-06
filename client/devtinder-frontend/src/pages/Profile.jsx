import { useEffect, useState } from "react";
import api from "../utils/api";

const Profile = () => {

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    age: "",
    skills: ""
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/view");

      const user = res.data;

      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || "",
        skills: user.skills?.join(", ") || ""
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: Number(profile.age),
        skills: profile.skills.split(",").map((s) => s.trim())
      };

      const res = await api.patch("/profile/edit", payload);

      setProfile({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        age: res.data.age,
        skills: res.data.skills.join(", ")
      });

      alert("Profile updated successfully");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#12051b] to-black flex justify-center pt-16 px-4">

      <div className="w-full max-w-2xl bg-[#0f0f14] border border-[#2a2a33] rounded-2xl p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Edit Profile
        </h1>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
            {profile.firstName?.charAt(0) || "U"}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-gray-400 text-sm">First Name</label>
              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full mt-1 bg-[#1a1a22] text-white border border-[#2a2a33] rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Last Name</label>
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full mt-1 bg-[#1a1a22] text-white border border-[#2a2a33] rounded-lg px-4 py-2"
              />
            </div>

          </div>

          {/* Age */}
          <div>
            <label className="text-gray-400 text-sm">Age</label>
            <input
              name="age"
              type="number"
              value={profile.age}
              onChange={handleChange}
              className="w-full mt-1 bg-[#1a1a22] text-white border border-[#2a2a33] rounded-lg px-4 py-2"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-gray-400 text-sm">
              Skills (comma separated)
            </label>
            <input
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              className="w-full mt-1 bg-[#1a1a22] text-white border border-[#2a2a33] rounded-lg px-4 py-2"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition"
          >
            Save Profile
          </button>

        </form>

      </div>
    </div>
  );
};

export default Profile;