import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateMyProfile,
  fetchMyProfile,
  checkUsername,
} from "../features/user/userThunks";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { me, loading, usernameAvailable, checkingUsername } = useSelector(
    (state) => state.user
  );

  // Local state for form fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Load user data
  useEffect(() => {
    if (!me) dispatch(fetchMyProfile());
  }, [me, dispatch]);

  // Set local form fields once user is loaded
  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName);
      setUsername(me.username);
      setBio(me.bio || "");
    }
  }, [me]);

  // Debounced username value
  const debouncedUsername = useDebounce(username, 400);

  // Trigger username check
  useEffect(() => {
    if (!debouncedUsername || !me) return;

    // If username unchanged → available
    if (debouncedUsername === me.username) return;

    dispatch(checkUsername(debouncedUsername));
  }, [debouncedUsername, dispatch, me]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (usernameAvailable === false) return;

    dispatch(
      updateMyProfile({
        displayName,
        username,
        bio,
      })
    ).then((res) => {
      if (!res.error) {
        navigate("/profile");
      }
    });
  };

  return (
    <div>
      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* Display Name */}
        <div>
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        {/* Username */}
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            minLength={3}
            maxLength={30}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
          />

          {/* Username validation messages */}
          {checkingUsername && <p>Checking username...</p>}

          {username !== me?.username && username.length >= 3 && (
            <>
              {usernameAvailable === false && (
                <p style={{ color: "red" }}>❌ Username taken</p>
              )}
              {usernameAvailable === true && (
                <p style={{ color: "green" }}>✔ Username available</p>
              )}
            </>
          )}
        </div>

        {/* Bio */}
        <div>
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <button
          type="submit"
          disabled={loading || usernameAvailable === false}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
