import { useEffect, useState } from "react";
import { BsPersonFill, BsCalendarFill } from "react-icons/bs";
import { RiTeamFill } from "react-icons/ri";
import { BiLogOut } from "react-icons/bi";
import axios from "axios";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Home = (props: any) => {
  const [profileData, setProfileData] = useState<any>("");
  function getData() {
    axios({
      method: "GET",
      url: "http://127.0.0.1:3000/profile",
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => {
        const res = response.data;
        res.access_token && props.setToken(res.access_token);
        props.setName(res.firstName);
        props.setAdmin(res.Admin);
        setProfileData({
          firstName: res.firstName,
          lastName: res.lastName,
          admin: res.Admin,
        });
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }
  // maybe export this function so navbar can also use it?
  // function logOut() {
  //   axios({
  //     method: "POST",
  //     url: "http://127.0.0.1:3000/logout",
  //   })
  //     .then((response) => {
  //       console.log(response.data);
  //       props.removeToken();
  //     })
  //     .catch((error) => {
  //       if (error.response) {
  //         console.log(error.response);
  //         console.log(error.response.status);
  //         console.log(error.response.headers);
  //       }
  //     });
  // }

  useEffect(() => {
    getData();
  }, []);

  const iconSize: number = 60;
  const styles = {
    container:
      "bg-slate-900 text-white p-4 flex rounded-lg border-2 border-slate-800 shadow-md shadow-black hover:bg-blue-600 hover:scale-105 duration-300 ease-in-out transition-all",
    container2:
      "bg-slate-900 text-white p-4 flex rounded-lg border-2 border-slate-800 shadow-md shadow-black hover:bg-blue-600 hover:scale-105 duration-300 ease-in-out transition-all md:col-span-2",
    text: "text-2xl mx-auto my-auto font-bold tracking-wide",
  };

  return (
    <>
      <Navbar
        name={props.name}
        admin={props.admin}
        removeToken={props.removeToken}
      />
      <div className="flex justify-center mt-20">
        <div className="w-[600px]">
          <div className="text-white text-[40px] md:text-[50px] font-pacifico tracking-wider text-center mt-4 select-none">
            Welcome, {profileData.firstName}
          </div>
          <h2 className="font-roboto text-center mb-4 -mt-2 text-gray-400 text-xl tracking-widest select-none">
            {profileData.admin ? "Admin" : "User"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            {profileData.admin ? (
              <a href="/team">
                <div className={styles.container}>
                  <RiTeamFill size={iconSize} />
                  <p className={styles.text}>Team</p>
                </div>
              </a>
            ) : null}
            <a href="/customers">
              <div className={styles.container}>
                <BsPersonFill size={iconSize} />
                <p className={styles.text}>Customers</p>
              </div>
            </a>
            <a href="/schedule">
              <div className={styles.container}>
                <BsCalendarFill size={iconSize} />
                <p className={styles.text}>Schedule</p>
              </div>
            </a>
            <div
              className={
                profileData.admin ? styles.container : styles.container2
              }
              onClick={props.removeToken}
            >
              <BiLogOut size={iconSize} />
              <p className={styles.text}>Logout</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
