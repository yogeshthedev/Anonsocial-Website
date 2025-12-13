import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunks";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState(""); // ✨ added
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, success } = useSelector(
    (state) => state.auth
  );


  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  const isGmail = (email) => {
    return email.endsWith("@gmail.com");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isGmail(email)) {
      alert("Email must end with @gmail.com");
      return;
    }

    dispatch(
      registerUser({
        displayName,
        username, // ✨ send username to backend
        email,
        password,
      })
    );
  };

  return (
    <div>
      <h2>Register</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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
          <label>Username (lowercase, no spaces)</label>
          <input
            type="text"
            value={username}
            minLength={3}
            maxLength={30}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label>Password (min 6 chars)</label>
          <input
            type="password"
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          Register
        </button>
      </form>

      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
};

export default Register;
