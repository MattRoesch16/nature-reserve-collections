import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { IoMdArrowRoundBack, IoMdTrash } from "react-icons/io";
import { CgProfile, CgWorkAlt } from "react-icons/cg";
import Day from "../components/Day";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import ServiceRecord from "../components/ServiceRecord";

/* schedule page showing month week and each individual day*/
const Schedule = (props: any) => {
  const [schedule, setSchedule] = useState<any>([]);
  const [employees, setEmployees] = useState<any>([]);

  // returns all service records with customer info
  const getSchedule = () => {
    axios({
      method: "GET",
      url: "http://127.0.0.1:3000/schedule/display",
      headers: {
        Authorization: "Bearer " + props.token,
      },
      // data: { "Start Date": "2023-04-02" },
    })
      .then((response) => {
        setSchedule(sortArray(response.data.services));
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        }
      });
  };
  // sorts the jobs into newest to oldest
  const sortArray = (arr: any) => {
    arr.sort((a: any, b: any) => {
      const aDateTime = new Date(`${a.start_date} ${a.start_time}`);
      const bDateTime = new Date(`${b.start_date} ${b.start_time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
    return arr;
  };

  /* Shows the team member page*/
  function getTeam() {
    axios({
      method: "GET",
      url: "http://127.0.0.1:3000/employees",
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => {
        setEmployees(response.data);
        console.log(employees);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        }
      });
  }
  useEffect(() => {
    getSchedule();
    getTeam();
  }, []);

  const styles = {
    links:
      "text-blue-500 border-b-2 border-transparent hover:border-blue-500 ease-in-out transition-all duration-300",
    label: "text-white py-2",
    input:
      "w-full border-2 appearance-none tracking-wider border-slate-900 p-2 my-1 bg-slate-700 text-white",
  };
  return (
    <>
      <div className="flex justify-center mt-5">
        <div className="w-[500px] p-4 bg-slate-900 border-2 border-slate-800 shadow-md shadow-black mb-2 rounded-xl h-full transition-all duration-300 ease-in-out">
          <h2 className="text-white cap font-roboto text-center text-4xl tracking-wide">
            Job Schedule
          </h2>
          <h3 className="text-gray-500 uppercase text-sm my-1 text-center tracking-wider">
            {schedule.length} upcoming jobs
          </h3>
        </div>
      </div>
      {/* schedule */}
      <div className="h-1 rounded-full w-[95%] mx-auto my-2 bg-slate-900/50" />
      <div className="grid grid-cols-4 gap-4 w-[90%] m-auto">
        {schedule.map((item: any, index: number) => (
          <ServiceRecord item={item} index={index} employees={employees} />
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Schedule;
