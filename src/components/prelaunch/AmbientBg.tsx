// Map of Africa as a full-bleed background with brand overlay layers
const AmbientBg = () => (
  <>
    {/* map.jpg — full bleed, desaturated */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: "url('/map.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "saturate(0.25) brightness(0.35)",
      }}
    />
    {/* Dark + green radial overlay — keeps brand feel and text legible */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% -5%, rgba(0,176,90,0.28) 0%, transparent 60%), " +
          "radial-gradient(ellipse 60% 50% at 90% 95%, rgba(0,176,90,0.15) 0%, transparent 55%), " +
          "linear-gradient(180deg, rgba(5,13,10,0.55) 0%, rgba(5,13,10,0.75) 100%)",
      }}
    />
    {/* Subtle dot-grid accent */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,176,90,0.8) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </>
);

export default AmbientBg;
