import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const ProfileModal = ({ setShowEdit, fetchUser }) => {
  const user = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    cover_photo: null,
    full_name: user.full_name,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const {
        full_name,
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
      } = editForm;

      formData.append("full_name", full_name);
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("location", location);
      if (profile_picture) formData.append("profile", profile_picture);
      if (cover_photo) formData.append("cover", cover_photo);

      const token = await getToken();
      const { data } = await api.put("/api/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Profile updated successfully!");
        fetchUser(); // ✅ Refresh profile after update
        setShowEdit(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      profile_picture: e.target.files[0],
                    })
                  }
                />
                <div className="relative mt-2 w-24 h-24">
                  <img
                    src={
                      editForm.profile_picture
                        ? URL.createObjectURL(editForm.profile_picture)
                        : user.profile_picture || "/default-avatar.png"
                    }
                    alt="profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 rounded-full cursor-pointer">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditForm({ ...editForm, cover_photo: e.target.files[0] })
                  }
                />
                <div className="relative mt-2 w-80 h-40">
                  <img
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user.cover_photo || "/default-cover.png"
                    }
                    alt="cover"
                    className="w-full h-full rounded-lg object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 rounded-lg cursor-pointer">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>

            {/* Name, Username, Bio, Location */}
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Full Name"
              value={editForm.full_name}
              onChange={(e) =>
                setEditForm({ ...editForm, full_name: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Username"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
            />
            <textarea
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="Bio"
              value={editForm.bio}
              onChange={(e) =>
                setEditForm({ ...editForm, bio: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
