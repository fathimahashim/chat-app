import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login, resetPass } from '../../config/firebase' // FIX 1: restPass -> resetPass (matches firebase.js export)

const Login = () => {
  const [currState, setCurrState] = useState("Sign up"); // FIX 2: SetCurrState -> setCurrState (hooks should be camelCase)
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt="" className="logo" />

      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>

        {currState === "Sign up" && (
          <input onChange={(e) => setUserName(e.target.value)} value={userName}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}

        <input onChange={(e) => setEmail(e.target.value)} value={email}
          type="email"
          placeholder="Email address"
          className="form-input"
          required
        />

        <input onChange={(e) => setPassword(e.target.value)} value={password}
          type="password"
          placeholder="Password"
          className="form-input"
          required
        />

        <button type="submit">
          {currState === "Sign up" ? "Create account" : "Login now"}
        </button>

        <div className="login-term">
          <input type="checkbox" />
          <p>By signing up, you agree to our Terms and Privacy Policy.</p>
        </div>

        <div className="login-forgot">
          {currState === "Sign up" ? (
            <p className="login-toggle">
              Already have an account?
              <span onClick={() => setCurrState("Login")}> Login here</span> {/* FIX 2: SetCurrState -> setCurrState */}
            </p>
          ) : (
            <p className="login-toggle">
              Create an account
              <span onClick={() => setCurrState("Sign up")}> Click here</span> {/* FIX 2: SetCurrState -> setCurrState */}
            </p>
          )}
          {currState === 'Login' ? ( // FIX 3: currentState -> currState (variable doesn't exist)
            <p className="login-toggle">
              Forgot Password?
              <span onClick={() => resetPass(email)}> reset here</span> {/* FIX 1: restPass -> resetPass */}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default Login