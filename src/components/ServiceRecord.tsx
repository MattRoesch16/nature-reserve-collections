import {
  IoMdTrash,
  IoMdCheckmarkCircle,
  IoMdCloseCircle,
  IoMdClipboard,
} from "react-icons/io";
import { useEffect, useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
const ServiceRecord = ({
  item,
  employees,
  token,
  getSchedule,
}: {
  item: any;
  employees: any;
  token: string;
  getSchedule: any;
}) => {
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [adminMenu, setAdminMenu] = useState<boolean>(false);
  const time = new Date();
  const [currentFEmpID, setCurrentFEmpID] = useState<any>("default");
  const [currentSEmpID, setCurrentSEmpID] = useState<any>("default");
  const [currentTEmpID, setCurrentTEmpID] = useState<any>("default");
  const [currentFoEmpID, setCurrentFoEmpID] = useState<any>("default");
  const [menu, setMenu] = useState<boolean>(false);
  const [generatorname, setGeneratorName] = useState<any>();
  const [startDate, setDate] = useState<any>();
  const [startTime, setTime] = useState<any>();
  const [jobNotes, setJobNotes] = useState<any>();
  const [serviceType, setServiceType] = useState<any>([]);
  const [generators, setGenerators] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [admin, setAdmin] = useState<Boolean>();

  const setFields = () => {
    setGeneratorName(item.generator_name);
  setServiceType(item.service_type);
  setJobNotes(item.jobNotes);
  setDate(item.start_date);
  setTime(item.set_time);
  };

  

  const serviceTypes: string[] = [
    "Installation",
    "Maintenance",
    "Repair",
    "Troubleshoot",
    "Other",
  ];

  const getGenerators = () => {
    axios({
      method: "GET",
      url: "http://127.0.0.1:3000/generators/details",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        setGenerators(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        }
      });
  };

  const getWorkers = () => {
    axios({
      method: "POST",
      url: "http://127.0.0.1:3000/schedule/workers",
      headers: {
        Authorization: "Bearer " + token,
      },
      data: {
        ServiceID: item.service_id,
      },
    })
      .then((response) => {
        if (response.data.length() < 4){
          response.data[0];
        }
        setWorkers(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
        }
      });
  };

  function getData() {
    axios({
      method: "GET",
      url: "http://127.0.0.1:3000/profile",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => {
        const res = response.data;
        res.access_token;
        setAdmin(Boolean(res.Admin));
        setAdminMenu(Boolean(res.Admin));
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  const deleteRecord = () => {
    if (
      confirm(
        "Are you sure you want to delete this record?\nThis action cannot be undone."
      ) == true
    ) {
      axios({
        method: "POST",
        url: "http://localhost:3000/schedule/delete",
        headers: {
          Authorization: "Bearer " + token,
        },
        data: {
          ServiceID: item.service_id,
        },
      })
        .then((response) => {
          toast.success("Record Delete");
          getSchedule();
          console.log(response);
        })
        .catch((error) => {
          toast.error("Something Went Wrong");
          if (error.response) {
            console.log(error.response);
          }
        });
    }
  };
  const editRecord = () => {
    {
      axios({
        method: "POST",
        url: "http://localhost:3000/schedule/edit",
        headers: {
          Authorization: "Bearer " + token,
        },
        data: {
          ServiceID: item.service_id,
          GeneratorName: generatorname,
          Date: startDate,
          Time: startTime,
          ServiceType: serviceType,
          Notes: jobNotes,
        },
      })
        .then((response) => {
            toast.success("Record Completed");
          getSchedule();
          console.log(response);
        })
        .catch((error) => {
          toast.error("Something Went Wrong");
          if (error.response) {
            console.log(error.response);
          }
        });
    }
  };
  const completeRecord = () => {
    {
      axios({
        method: "POST",
        url: "http://localhost:3000/schedule/complete",
        headers: {
          Authorization: "Bearer " + token,
        },
        data: {
          ServiceID: item.service_id,
          completeDate:
            time.getFullYear() +
            "-" +
            (time.getMonth() + 1) +
            "-" +
            time.getDate(),
          completeTime: time.getHours() + ":" + time.getMinutes(),
        },
      })
        .then((response) => {
          if (response.data.Service_Performed == true) {
            toast.success("Record Completed");
          } else {
            toast.success("Record Incomplete");
          }
          getSchedule();
          console.log(response);
        })
        .catch((error) => {
          toast.error("Something Went Wrong");
          if (error.response) {
            console.log(error.response);
          }
        });
    }
  };

  const addTech = (e: any) => {
    e.preventDefault();
    setOpenMenu(false);
    axios({
      method: "POST",
      url: "http://127.0.0.1:3000/schedule/techs",
      headers: {
        Authorization: "Bearer " + token,
      },
      data: {
        ServiceID: item.service_id,
        FirstEmployeeID: currentFEmpID,
        SecondEmployeeID: currentSEmpID,
        ThirdEmployeeID: currentTEmpID,
        FourthEmployeeID: currentFoEmpID,
      },
    })
      .then((response) => {
        toast.success("Tech Added");
        console.log(response);
        getWorkers();
      })
      .catch((error) => {
        toast.error("Something Went Wrong");
        if (error.response) {
          console.log(error.response);
        }
      });
  };
  useEffect(() => {
    getData();
    getGenerators();
    getWorkers();
  }, []);

  return (
    <>
      <Toaster />
      <div className="bg-slate-800/80 h-full pb-2 pt-2 mt-2 rounded-xl shadow-lg border-2 border-slate-500 shadow-slate-700">
        <div className="text-white tracking-widest ml-4">
          <div className="flex justify-between">
            <div className="text-[15px] w-[150px]">
              {/* <CgProfile size={20} /> */}
              <p className="my-auto">
                {item.customer_first_name} {item.customer_last_name}
              </p>
              <p>
                {item.street}, {item.city}
              </p>
            </div>
            {!menu ? (
                        <button
                        className="mr-4"
                          onClick={() => setMenu(true)}
                        >
                          <IoMdClipboard size={30} />
                        </button>
                      ) : (
                        <button
                        className="mr-4"
                          onClick={() => setMenu(false)}
                        >
                          <IoMdCloseCircle size={30} />
                        </button>
                      )}
                      <div
                      className={
                        menu
                          ? "opacity-1 transition-all ease-in-out duration-500"
                          : "opacity-0 transition-all ease-in-out duration-500"
                      }
                    ></div>
            {menu ? (
                        <>
                          <form onSubmit={editRecord}>
              <div className="grid md:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label>Date:</label>
                  <input
                    type="date"
                    required
                    onChange={(e) => setDate(e.target.value)}
                    value={startDate}
                  />
                </div>
                <div className="col-span-2">
                  <label>Time:</label>
                  <input
                    type="time"
                    required
                    onChange={(e) => setTime(e.target.value)}
                    value={startTime}
                  />
                </div>
                <div className="col-span-2">
                  <label>Generator:</label>
                  <select
                    required
                    onChange={(e) => {
                      setJobNotes(e.target.value.split(",")[0]);
                      setGeneratorName(e.target.value.split(",")[1]);
                    }}
                  >
                    <option value={"default"}>(Please Select a Value)</option>
                    {generators.map((gen, index) => (
                      <option key={index} value={[gen.gNotes, gen.gID]}>
                        {gen.gName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label>Service Type:</label>
                  <select
                    required
                    onChange={(e) => {
                      setServiceType(e.target.value);
                    }}
                  >
                    <option value={"default"}>(Please Select a Value)</option>
                    {serviceTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <label>Notes:</label>
                  <textarea
                    className="w-full h-[100px] rounded-lg border-2 tracking-wider border-slate-900 p-2 bg-slate-700 text-white"
                    onChange={(e) => setJobNotes(e.target.value)}
                    value={jobNotes}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 border-2 text-black border-blue-800 text-lg px-4 py-2 rounded-lg my-4 w-full col-span-2 hover:bg-blue-700 transition-all ease-in-out duration-300"
              >
                Edit Job
              </button>
            </form>
                        </>
                      ) : null}
            {admin ? (
              <button onClick={() => deleteRecord()} className="mr-4">
                <IoMdTrash
                  className="hover:text-red-500 ease-in-out transition-all duration-300"
                  size={30}
                />
              </button>
            ) : null}
          </div>
        </div>
        <div className="bg-slate-600 text-white p-4 mt-2">
          <div className="text-sm px-2 tracking-wider capitalize">
            <p className="text-white uppercase font-bold text-center text-[16px]">
              {item.service_type}
            </p>
            <p className="text-gray-300 mb-2 text-center tracking-wide font-semibold text-[14px]">
              {item.generator_name}
            </p>
            <div className="flex select-none justify-evenly text-center rounded-lg bg-slate-800/70 p-2 border-2 border-slate-600">
              <div>
                <p className="text-gray-200">{item.start_date}</p>
                <p className="text-gray-400">{item.start_time}</p>
              </div>
              {item.finish_date && admin ? (
                <div>
                  <p className="text-gray-300 text-[25px]">-</p>
                  <button onClick={() => completeRecord()}>
                    <IoMdCloseCircle
                      className="hover:text-red-500 ease-in-out transition-all duration-300"
                      size={20}
                    />
                  </button>
                </div>
              ) : (
                <p className="text-gray-300 text-[25px] my-auto">-</p>
              )}
              <div>
                {item.finish_date ? (
                  <div>
                    <p className="text-gray-200">{item.finish_date}</p>
                    <p className="text-gray-400">{item.finish_time}</p>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => completeRecord()}>
                      <IoMdCheckmarkCircle
                        className="hover:text-green-500 transition-all ease-in-out duration-300"
                        size={35}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {openMenu ? (
          <>
            <div className="h-[65px] overflow-y-auto border-b-2 border-b-gray-500">
              <p className="m-2 text-gray-300 tracking-wide">{item.notes}</p>
            </div>
            {admin ? (
              <div className="grid grid-cols-2 mt-2 px-2 gap-2">
                <select
                  required
                  onChange={(e) => {
                    setCurrentFEmpID(e.target.value);
                  }}
                >
                  <option value={"default"}>{workers[0]}</option>
                  {employees.map((item: any, index: number) => (
                    <option key={index} value={item.id}>
                      {item.fN}
                    </option>
                  ))}
                </select>
                <select
                  required
                  onChange={(e) => {
                    setCurrentSEmpID(e.target.value);
                  }}
                >
                  <option value={"default"}>Employee 2</option>
                  {employees.map((item: any, index: number) => (
                    <option key={index} value={item.id}>
                      {item.fN}
                    </option>
                  ))}
                </select>
                <select
                  required
                  onChange={(e) => {
                    setCurrentTEmpID(e.target.value);
                  }}
                >
                  <option value={"default"}>Employee 3</option>
                  {employees.map((item: any, index: number) => (
                    <option key={index} value={item.id}>
                      {item.fN}
                    </option>
                  ))}
                </select>
                <select
                  required
                  onChange={(e) => {
                    setCurrentFoEmpID(e.target.value);
                  }}
                >
                  <option value={"default"}>Employee 4</option>
                  {employees.map((item: any, index: number) => (
                    <option key={index} value={item.id}>
                      {item.fN}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-500 border-2 font-bold border-blue-800 text-lg py-1 col-span-2 rounded-lg hover:bg-blue-700 transition-all ease-in-out duration-300"
                  onClick={addTech}
                >
                  Assign Job
                </button>
              </div>
            ) : null}
          </>
        ) : null}
        <div className="flex justify-center">
          <button onClick={() => setOpenMenu(!openMenu)}>
            {!openMenu ? (
              <MdExpandMore size={30} className="text-white -mb-4" />
            ) : (
              <MdExpandLess size={30} className="text-white -mb-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ServiceRecord;
