import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../features/auth/authThunks";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, success } = useSelector(
    (state) => state.auth
  );

  // Redirect after successful register
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/me"); // or home page
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      loginUser({
        email,
        password,
      })
    );
  };

  return (
    <div>
      <h2>login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
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
          Login
        </button>
      </form>

      <p>
        Create a new account <a href="/register">Register</a>
      </p>
    </div>
  );
};

export default Login;
