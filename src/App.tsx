import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin";
import Schedule from "./pages/Schedule";
import Customers from "./pages/Customers";
import Home from "./pages/Home";
import Team from "./pages/Team";
import useToken from "./components/useToken";
import Navbar from "./components/Navbar";

function App() {
  const { token, removeToken, setToken } = useToken();
  return (
    <BrowserRouter>
      {!token && token !== "" && token !== undefined ? (
        <Signin setToken={setToken} />
      ) : (
        <>
          <Routes>
            <Route
              path={"/*"}
              element={
                <>
                  <Navbar
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                  <Home
                    token={token}
                    removeToken={removeToken}
                    setToken={setToken}
                  />
                </>
              }
            />
            <Route
              path="/schedule"
              element={
                <>
                  <Navbar
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                  <Schedule
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                </>
              }
            />
            <Route
              path="/customers"
              element={
                <>
                  <Navbar
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                  <Customers
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                </>
              }
            />
            <Route
              path="/team"
              element={
                <>
                  <Navbar
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                  <Team
                    token={token}
                    setToken={setToken}
                    removeToken={removeToken}
                  />
                </>
              }
            />
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
