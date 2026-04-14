import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",

    firstName: "",
    lastName: "",
    age: "",
    skills: "",
    about: "",
    photourl: ""
  });

  const [tempImage, setTempImage] = useState(null); // 🔥 temp image
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const displayImage = tempImage || profile.photourl;

  // ✅ FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/view");
        const user = res.data;

        setProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          age: user.age || "",
          skills: user.skills?.join(", ") || "",
          about: user.about || "",
          photourl: user.photourl || ""
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile details");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ INPUT CHANGE
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 🔥 IMAGE UPLOAD (TEMP ONLY)
  const handleImageUpload = async (e) => {
    if (uploading) return;

    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = res.data?.url;
      if (!imageUrl) throw new Error("No URL returned");

      // ✅ only temp store (NO UI change yet)
      setTempImage(imageUrl);

    } catch (err) {
      console.error(err);
      toast.error("Upload failed ❌");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ✅ SAVE PROFILE (FINAL APPLY)
  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const finalImage = tempImage || profile.photourl;
      const trimmedSkills = profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age === "" ? undefined : Number(profile.age),
        skills: trimmedSkills,
        about: profile.about,
        photourl: finalImage
      };

      await api.patch("/profile/edit", payload);

      // 🔥 update only AFTER save
      setProfile((prev) => ({
        ...prev,
        photourl: finalImage
      }));

      setTempImage(null);

      toast.success("Profile updated 🚀");

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="page-section flex justify-center px-4 py-8">
        <div className="page-card w-full max-w-2xl p-6 sm:p-8 animate-pulse flex flex-col items-center">
          <div className="w-28 h-28 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 mt-10"></div>
          <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-4 mt-2"></div>
          <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="w-full h-28 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section flex justify-center px-4 py-8">
      <div className="page-card w-full max-w-2xl p-6 sm:p-8">
        <h1 className="page-title mb-2 text-center">
          Edit Profile
        </h1>
        <p className="page-subtitle mb-6 text-center">
          Keep your details fresh so the right people can find you.
        </p>

        {/* 🔥 AVATAR */}
        <div className="flex justify-center mb-6 relative">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group rounded-full"
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt="Profile"
                className={`h-28 w-28 rounded-full border-[3px] border-pink-500 object-cover transition-all duration-300 ${uploading ? 'opacity-50 blur-sm scale-95' : 'group-hover:opacity-80 group-hover:scale-105 shadow-xl shadow-pink-500/20'}`}
              />
            ) : (
              <div className={`w-28 h-28 rounded-full shadow-xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold transition-all duration-300 ${uploading ? 'opacity-50 blur-sm scale-95' : 'group-hover:scale-105 hover:shadow-pink-500/30 group-hover:opacity-90'}`}>
                {profile.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            {/* Camera Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-300 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploading ? (
                 <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleSave}>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="field-input"
            />

            <input
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="field-input"
            />
          </div>

          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            placeholder="Age"
            className="field-input w-full"
          />

          <textarea
            name="about"
            value={profile.about}
            onChange={handleChange}
            placeholder="Bio"
            className="field-textarea min-h-28 w-full"
          />

          <input
            name="skills"
            value={profile.skills}
            onChange={handleChange}
            placeholder="Skills (comma separated)"
            className="field-input w-full"
          />

          <button
            type="submit"
            disabled={saving || uploading}
            className="primary-button w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? (
              <>
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                 Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>

        </form>

      </div>

      {/* 🔥 IMAGE MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={displayImage}
              alt="Profile preview"
              className="max-w-[90vw] max-h-[80vh] rounded-lg"
            />
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-2 right-2 bg-black text-white px-3 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
