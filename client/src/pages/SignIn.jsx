import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import databg from "../assets/databg.png";
import logo from "../assets/logo.png";
import { supabase } from "../supabaseClient";

export default function SignIn() {
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) {
      setMsg({ type: "error", text: "Email and password are required." });
      return;
    }

    try {
      setIsBusy(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Supabase session is now created in the browser
      // onAuthStateChange will update isSignedIn
      navigate("/");
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Sign-in failed" });
      setPassword("");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${databg})` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-sm">
        <img src={logo} alt="TariffSim Logo" className="mx-auto h-20 w-auto" />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to Tariff Sim
        </h2>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-100">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isBusy}
                className="mt-2 block w-full rounded-md bg-white/10 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBusy}
                className="mt-2 block w-full rounded-md bg-white/10 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className={`flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-black ${
                isBusy
                  ? "bg-indigo-500/70 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              {isBusy ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {msg && (
            <div
              className={`mt-4 text-sm px-3 py-2 rounded-md ${
                msg.type === "success"
                  ? "bg-emerald-600/20 text-emerald-100"
                  : "bg-rose-600/20 text-rose-100"
              }`}
            >
              {msg.text}
            </div>
          )}

          <p className="mt-4 text-center text-sm text-slate-300">
            New to Tariff Sim?{" "}
            <Link to="/signup" className="font-semibold text-white">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
