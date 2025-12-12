import React from "react";
import { Link } from "react-router-dom";

const ProfileHeader = ({ user, isAuthenticated }) => {
  if (!user) return null;

  return (
    <div>
      {/* Avatar */}
      <div>
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="Avatar" width={80} height={80} />
        ) : (
          <div>No Avatar</div>
        )}
      </div>

      {/* Display Name */}
      <h2>{user.displayName}</h2>

      {/* Username */}
      <p>@{user.username}</p>

      {/* Bio */}
      <p>{user.bio || "No bio available."}</p>

      {/* Edit Buttons Only If Owner */}
      {isAuthenticated && (
        <div>
          <Link to="/profile/edit">Edit Profile</Link>
          <br />
          <Link to="/profile/change-avatar">Change Avatar</Link>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
