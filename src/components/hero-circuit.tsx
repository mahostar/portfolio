// Keep the copper lighting while preserving the original hero composition.
export function HeroCircuit() {
  return (
    <div className="hero-circuit pcb-motion" aria-hidden="true">
      <div className="pcb-trace-mask">
        <span className="pcb-trace-light" />
        <span className="pcb-trace-sweep" />
      </div>
    </div>
  );
}
