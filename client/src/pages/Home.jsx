import bg from "../assets/bg.jpg"
export default function Home(){
function TrendCard({ title, value, change, direction = "up", subtitle }) {
  const isUp = direction === "up";
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/70 backdrop-blur p-4 hover:shadow-lg hover:shadow-black/20 transition-all">
      <div className="text-slate-300 text-sm">{title}</div>

      <div className="mt-1 flex items-baseline gap-3">
        <div className="text-2xl md:text-3xl font-semibold text-white">{value}</div>

        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
          ${isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}
        >
          {/* Arrow icon (pure SVG to avoid extra deps) */}
          <svg
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${isUp ? "" : "rotate-180"}`}
            fill="currentColor"
          >
            <path d="M10 3l4.5 6h-3v8h-3V9h-3L10 3z" />
          </svg>
          <span>{change}</span>
        </div>
      </div>

      {subtitle && <div className="mt-1 text-xs text-slate-400">{subtitle}</div>}

      {/* subtle progress bar accent (optional) */}
      <div className="mt-4 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={`h-full ${isUp ? "bg-emerald-500/70" : "bg-rose-500/70"} transition-all`}
          style={{ width: isUp ? "62%" : "38%" }}
        />
      </div>
    </div>
  );
}
return (
    <section
      className="relative flex items-center min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          `url(${bg})`,
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 text-left ml-0 mr-auto">

        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Welcome To Tarrif Sim
        </h1>

        <p className="text-slate-300 text-base md:text-lg mb-10 max-w-2xl">
        A smart simulator that shows what happens when India changes its palm-oil import duties. Watch how prices, imports, and farmer earnings shift, and explore balanced policies for both consumers and producers.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <TrendCard
        title="Global CPO Price"
        value="$940/MT"
        change="+3.4% MoM"
        direction="up"
        subtitle="Last 30 days"
      />
      <TrendCard
        title="Palm Oil Imports"
        value="0.68 MMT"
        change="−7.0% MoM"
        direction="down"
        subtitle="Monthly arrivals"
      />
      <TrendCard
        title="Retail Edible Oil"
        value="₹138/kg"
        change="+1.2% MoM"
        direction="up"
        subtitle="All-India average"
      />
      <TrendCard
        title="Farmer FFB Price"
        value="₹10,850/t"
        change="+6.0% YoY"
        direction="up"
        subtitle="Indicative price"
      />
    </div>
      </div>
    </section>
  );
}