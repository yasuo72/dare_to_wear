import React, { useState } from "react";
import "./LoginSignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";

const LoginSignUp = () => {
  const [activeTab, setActiveTab] = useState("tabButton1");
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleTab = (tab) => {
    setActiveTab(tab);
    clearError();
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        toast.success("Login successful! Welcome back.");
        navigate("/");
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await register(registerData.name, registerData.email, registerData.password);
      
      if (result.success) {
        toast.success("Registration successful! Welcome to UOMO.");
        navigate("/");
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="loginSignUpSection">
        <div className="loginSignUpContainer">
          <div className="loginSignUpTabs">
            <p
              onClick={() => handleTab("tabButton1")}
              className={activeTab === "tabButton1" ? "active" : ""}
            >
              Login
            </p>
            <p
              onClick={() => handleTab("tabButton2")}
              className={activeTab === "tabButton2" ? "active" : ""}
            >
              Register
            </p>
          </div>
          <div className="loginSignUpTabsContent">
            {/* tab1 */}

            {activeTab === "tabButton1" && (
              <div className="loginSignUpTabsContentLogin">
                <form onSubmit={handleLoginSubmit}>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email address *" 
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required 
                  />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Password *" 
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required 
                  />
                  <div className="loginSignUpForgetPass">
                    <label>
                      <input 
                        type="checkbox" 
                        name="rememberMe"
                        className="brandRadio" 
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                      />
                      <p>Remember me</p>
                    </label>
                    <p>
                      <Link to="/resetPassword">Lost password?</Link>
                    </p>
                  </div>
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </form>
                <div className="loginSignUpTabsContentLoginText">
                  <p>
                    No account yet?{" "}
                    <span onClick={() => handleTab("tabButton2")}>
                      Create Account
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Tab2 */}

            {activeTab === "tabButton2" && (
              <div className="loginSignUpTabsContentRegister">
                <form onSubmit={handleRegisterSubmit}>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Username *" 
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required 
                  />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email address *" 
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required 
                  />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Password *" 
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required 
                  />
                  <p>
                    Your personal data will be used to support your experience
                    throughout this website, to manage access to your account,
                    and for other purposes described in our
                    <Link
                      to="/terms"
                      style={{ textDecoration: "none", color: "#c32929" }}
                    >
                      {" "}
                      privacy policy
                    </Link>
                    .
                  </p>
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Register"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginSignUp;
