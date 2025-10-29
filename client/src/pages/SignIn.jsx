import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import databg from "../assets/databg.png";
import logo from "../assets/logo.png";

const ALLOWED_DOMAINS = ["gov.in", "nic.in", "ias.nic.in", "ifs.nic.in"];

export default function SignIn({setIsSignedIn}) {
  const [isBusy, setIsBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  function isGovEmail(e = "") {
    const lower = e.toLowerCase();
    return ALLOWED_DOMAINS.some((d) => lower.endsWith("@" + d));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!isGovEmail(email)) {
      setMsg({ type: "error", text: "Only official government emails allowed (e.g., @nic.in, @gov.in)." });
      return;
    }
    if (!password) {
      setMsg({ type: "error", text: "Password is required." });
      return;
    }

      try {
      setIsBusy(true);

      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend sets an HttpOnly cookie; included credentials so the browser saves it.
        credentials: "include",
        body: JSON.stringify({ govt_email: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Sign-in failed");
      }

      // success UI
      setMsg({ type: "success", text: "Signed in successfully." });
      setIsSignedIn(true);
      setPassword("");

      // Navigate to your app’s protected area (adjust path as needed)
      // Small delay so the success banner is visible
      setTimeout(() => navigate("/"), 400);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Something went wrong." });
      setPassword("");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${databg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-sm">
        <img src={logo} alt="TariffSim Logo" className="mx-auto h-20 w-auto" />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to Tariff Sim
        </h2>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  placeholder="you@nic.in"
                  className="block w-full rounded-md bg-white/10 px-3 py-2 text-base text-white placeholder:text-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                  Password
                </label>
                <a href="#" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">
                  Forgot password?
                </a>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                  placeholder="••••••••"
                  className="block w-full rounded-md bg-white/10 px-3 py-2 text-base text-white placeholder:text-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className={`flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-black transition ${
                isBusy ? "bg-indigo-500/70 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              {isBusy ? "Signing in..." : "Sign In"}
            </button>
          </form>

           {/* status banner */}
          {msg && (
            <div
              role="status"
              aria-live="polite"
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
            <Link
              to="/signup"
              className="font-semibold text-white hover:text-indigo-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
