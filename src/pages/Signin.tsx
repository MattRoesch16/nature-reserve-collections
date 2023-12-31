import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

// SignIn function that will check the validity of the login information
function Signin(props: any) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [forgot, setForgotStatus] = useState<boolean>(false);
  const [Signup, setSigninStatus] = useState<boolean>(false);
  const navigate = useNavigate();

  function delay(ms = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function logMeIn(e: any) {
    console.log("remember me " + rememberMe);
    const toastId = toast.loading("Please wait...");
    e.preventDefault();
    axios({
      method: "POST",
      url: "http://127.0.0.1:3000/token",
      data: {
        email: email,
        password: password,
        remember: rememberMe,
      },
    })
      .then(async (response) => {
        toast.success("Login Successful", {
          id: toastId,
        });
        await delay();
        props.setToken(response.data.access_token);
      })
      .catch(async (error) => {
        if (error.response) {
          await delay();
          toast.error(error.response.data.msg, {
            id: toastId,
          });
          if (error.response.data.msg == "Invalid Password") {
            setPassword("");
          } else {
            setPassword("");
            setEmail("");
          }
        }
      });
  }

  function SignMeUp(e: any) {
    console.log("remember me " + rememberMe);
    const toastId = toast.loading("Please wait...");
    e.preventDefault();
    axios({
      method: "POST",
      url: "http://127.0.0.1:3000/signup",
      data: {
        username: userName,
        email: email,
        password: password,
        remember: rememberMe,
      },
    })
      .then(async (response) => {
        toast.success("Login Successful", {
          id: toastId,
        });
        await delay();
        props.setToken(response.data.access_token);
      })
      .catch(async (error) => {
        if (error.response) {
          await delay();
          toast.error(error.response.data.msg, {
            id: toastId,
          });
          if (error.response.data.msg == "Invalid Password") {
            setPassword("");
          } else {
            setPassword("");
            setEmail("");
          }
        }
      });
  }

  function checkRecovery(e: any) {
    const toastId = toast.loading("Please wait...");
    e.preventDefault();
    axios({
      method: "POST",
      url: "http://127.0.0.1:3000/recovery/check",
      data: {
        email: email,
        code: code,
        new_password: newPassword,
      },
    })
      .then(async (response) => {
        toast.success("Password Changed", {
          id: toastId,
        });
        await delay();
        props.setToken(response.data.access_token);
      })
      .catch(async (error) => {
        if (error.response) {
          await delay();
          toast.error(error.response.data.msg, {
            id: toastId,
          });
          if (error.response.data.msg == "Invalid Code or Email") {
            setPassword("");
          } else {
            setPassword("");
            setEmail("");
          }
        }
      });
  }

  useEffect(() => {
    navigate("/"); // resets browser path back to /
  }, []);

  return (
    <div className="flex min-h-screen justify-center">
      <Toaster />
      <div className="my-auto w-full max-w-[550px] p-4">
        <div className="my-auto">
          <div className="-mb-6">
            <Logo />
          </div>
          <div
            className={`mt-10 bg-slate-700 shadow-xl shadow-slate-700 rounded-xl border-2 border-slate-500 ${
              Signup ? "h-[575px]" : "h-[500px]"
            }`}
          >
            <div className="flex justify-center">
              <div className="w-[500px] p-8">
                <h2 className="text-white cap font-bold text-center text-xl tracking-wide">
                  Sign in to your account
                </h2>

                <div className="flex justify-center mt-2">
                  <button
                    className={
                      "bg-blue-500 border-2 border-blue-800 text-lg px-4 py-2 mt-4 rounded-lg hover:bg-blue-700 transition-all ease-in-out duration-300"
                    }
                    onClick={() => setSigninStatus(!Signup)}
                  >
                    {!Signup ? "Sign Up" : "Sign In"}
                  </button>
                </div>

                {!Signup ? (
                  <form onSubmit={logMeIn}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      placeholder="name@company.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label>Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-between mt-4">
                      <div className="flex">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 mt-1 accent-blue-500"
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <p className="text-gray-300">Remember me</p>
                      </div>
                      <div className="flex">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 mt-1 accent-blue-500"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <p className="text-gray-300">
                          {showPassword ? "Hide" : "Show"} password
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="bg-blue-500 border-2 border-blue-800 text-lg px-4 py-2 mt-4 rounded-lg w-full hover:bg-blue-700 transition-all ease-in-out duration-300"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={SignMeUp}>
                    <label>UserName</label>
                    <input
                      type="text"
                      placeholder="User Name"
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      placeholder="name@company.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label>Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-between mt-4">
                      <div className="flex">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 mt-1 accent-blue-500"
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <p className="text-gray-300">Remember me</p>
                      </div>
                      <div className="flex">
                        <input
                          type="checkbox"
                          className="w-4 h-4 mr-2 mt-1 accent-blue-500"
                          onChange={() => setShowPassword(!showPassword)}
                        />
                        <p className="text-gray-300">
                          {showPassword ? "Hide" : "Show"} password
                        </p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 border-2 border-blue-800 text-lg px-4 py-2 mt-4 rounded-lg w-full hover:bg-blue-700 transition-all ease-in-out duration-300"
                    >
                      Sign Up
                    </button>
                  </form>
                )}

                <div className="flex justify-center mt-2">
                  <button
                    className={
                      "text-white border-b-2 tracking-wide border-transparent hover:border-blue-500 ease-in-out transition-all duration-300"
                    }
                    onClick={() => setForgotStatus(!forgot)}
                  >
                    {!forgot ? "Forgot Password?" : "Cancel Reset"}
                  </button>
                </div>
                <div className="tracking-wide">
                  <p className="text-center text-gray-300 text-md">
                    Contact your admin for registration or a recovery code.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Signin;
