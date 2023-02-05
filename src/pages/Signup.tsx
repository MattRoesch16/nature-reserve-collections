import Footer from "../components/Footer";
import Logo from "../components/Logo";

// USED FOR TESTING
const getData = async () => {
  const response = await fetch("/profile");
  const data = await response.json();
  console.log(data);
};

function Signup() {
  const styles: { links: string; label: string; input: string } = {
    links:
      "text-blue-500 border-b-2 border-transparent hover:border-blue-500 ease-in-out transition-all duration-300",
    label: "text-white py-2",
    input:
      "w-full rounded-lg border-2 tracking-wider border-slate-900 p-2 bg-slate-700 text-white",
  };
  return (
    <div className="mt-[125px] flex justify-center">
      <div>
        <div className="-mb-6">
          <Logo />
        </div>
        <div className="mt-10 bg-slate-800 shadow-xl shadow-black rounded-xl border-2 border-slate-900 h-[530px]">
          <div className="flex justify-center">
            <div className="w-[500px] p-8">
              <h2 className="text-white cap font-bold text-center text-xl tracking-wide">
                Create an account
              </h2>
              <p className={styles.label}>Name</p>
              <input
                type="text"
                className={styles.input}
                placeholder="first name"
              />
              <p className={styles.label}>Your email</p>
              <input
                type="email"
                className={styles.input}
                placeholder="name@company.com"
              />
              <p className={styles.label}>Password</p>
              <input
                type="password"
                className={styles.input}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              />
              <p className={styles.label}>Confirm password</p>
              <input
                type="password"
                className={styles.input}
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              />
              <div className="flex justify-center">
                <button className="bg-blue-500 border-2 border-blue-800 text-lg px-4 py-2 rounded-lg mt-4 w-full hover:bg-blue-700 transition-all ease-in-out duration-300">
                  Create an account
                </button>
              </div>
              <div className="mt-4">
                <p className="text-center text-gray-300 text-md">
                  Already have an account?{" "}
                  <a href="/" className={styles.links}>
                    Login here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Signup;
