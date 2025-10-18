import logo from "../assets/logo.png"
export default function Navbar(){
    return(
        <>
          <div className="h-16 w-full bg-black flex items-center text-white justify-between">
          <img src={logo} alt="Tariff Sim Logo" className="h-16 w-16" />
          <div className="flex items-center gap-8 text-white">
              <a href="#home" className="text-white hover:text-indigo-400 transition-colors">Home</a>
               <a href="#trends" className="hover:text-indigo-400">Trends</a>
               <a href="#dashboard" className="hover:text-indigo-400">Dashboard</a>
          </div>
          <p className="px-2">Log In</p>
          </div>
        </>
    )
}