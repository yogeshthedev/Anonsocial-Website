import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProfileHeader from "../components/ProfileHeader";
import ProfilePosts from "../components/ProfilePosts";
import { fetchMyProfile } from "../features/user/userThunks";

const Profile = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { me } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  return (
    <div>
      <h1>Profile</h1>

      {/* Profile Header */}
      <ProfileHeader user={me} isAuthenticated={true} />

      {/* List of Posts (you will implement postSlice later) */}
      <ProfilePosts posts={me?.postsCount || []} />
    </div>
  );
};

export default Profile;
