export default function Card({ title, children, className="" }) {
  return (
    <section className={`card ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      {children}
    </section>
  );
}
