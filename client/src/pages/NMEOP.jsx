import { useState } from "react";
import nmeop1 from "../assets/nmeop1.png";
import nmeop2 from "../assets/nmeop2.png";
import nmeop3 from "../assets/nmeop3.png";
import nmeop4 from "../assets/nmeop4.png";

export default function NMEOP() {
  const images = [nmeop1, nmeop2, nmeop3, nmeop4];
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ---------------- Carousel ---------------- */}
        <div className="relative bg-slate-100 rounded-2xl shadow overflow-hidden">
          <img
            src={images[index]}
            alt={`NMEOP visual ${index + 1}`}
            className="w-full h-65 md:h-85 object-fill bg-[#f9f9f9]"
          />

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="
              absolute! left-4! inset-y-0! my-auto!
              flex! items-center! justify-center!
              w-14! h-14!
              rounded-full!
              bg-white/85!
              text-slate-800!
              text-4xl!
              leading-none!
              shadow-xl!
              backdrop-blur!
              transition-all! duration-200!
              hover:bg-white! hover:scale-105!
              active:scale-95!
            "
          >
            ‹
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next"
            className="
              absolute! right-4! inset-y-0! my-auto!
              flex! items-center! justify-center!
              w-14! h-14!
              rounded-full!
              bg-white/85!
              text-slate-800!
              text-4xl!
              leading-none!
              shadow-xl!
              backdrop-blur!
              transition-all! duration-200!
              hover:bg-white! hover:scale-105!
              active:scale-95!
            "
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition
                  ${i === index ? "bg-slate-800" : "bg-slate-400/60"}
                `}
              />
            ))}
          </div>
        </div>

        {/* ---------------- Info Section ---------------- */}
        <section className="bg-white rounded-2xl shadow p-6 space-y-5">
          <h1 className="text-2xl font-bold text-slate-800">
            National Mission on Edible Oils – Oil Palm (NMEOP)
          </h1>

          <p className="text-slate-600 leading-relaxed">
            The <strong>National Mission on Edible Oils – Oil Palm (NMEOP)</strong>
            is a centrally sponsored scheme launched by the Government of India
            in <strong>August 2021</strong>. The mission aims to increase domestic
            production of edible oils, particularly crude palm oil (CPO), and
            reduce India’s heavy dependence on imports.
          </p>

          <p className="text-slate-600 leading-relaxed">
            India imports more than <strong>60% of its edible oil requirement</strong>,
            making it one of the largest edible oil importers globally. Palm oil
            constitutes a major share of these imports. NMEOP seeks to address
            this gap by expanding oil palm cultivation in suitable regions while
            ensuring environmental sustainability and farmer welfare.
          </p>

          <h2 className="text-lg font-semibold text-slate-800">
            Key Objectives
          </h2>

          <ul className="list-disc pl-6 text-slate-600 space-y-1">
            <li>Increase domestic production of palm oil</li>
            <li>Reduce import dependence and save foreign exchange</li>
            <li>Ensure remunerative prices for farmers</li>
            <li>Promote sustainable and eco-sensitive cultivation practices</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-800">
            Strategy & Focus Areas
          </h2>

          <ul className="list-disc pl-6 text-slate-600 space-y-1">
            <li>
              Expansion of oil palm cultivation to about <strong>6.5 lakh hectares</strong>
              by 2025–26
            </li>
            <li>
              Focus on suitable regions such as North-East India, Andaman & Nicobar
              Islands, and parts of Andhra Pradesh, Telangana, Tamil Nadu, Karnataka,
              Odisha, and Kerala
            </li>
            <li>
              Price assurance to farmers through <strong>Viability Gap Funding (VGF)</strong>
              if market prices fall below benchmark rates
            </li>
            <li>
              Financial and technical support for planting material, intercropping,
              irrigation, and processing infrastructure
            </li>
          </ul>

          <p className="text-slate-600 leading-relaxed">
            Through NMEOP, the government aims to create a balanced ecosystem that
            benefits farmers, consumers, and industry while strengthening India’s
            long-term edible oil security.
          </p>
        </section>

        {/* ---------------- Official Link ---------------- */}
        <div className="text-center">
          <a
            href="https://nmeo.dac.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl
                       bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-700 transition"
          >
            Visit Official NMEOP Website
          </a>

          <p className="mt-2 text-xs text-slate-500">
            Source: Department of Agriculture & Farmers Welfare, Government of India
          </p>
        </div>

      </div>
    </div>
  );
}
