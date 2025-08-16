export default function TeamReview({ result }) {
  if (!result) return null;
  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Team Rating</h3>
          <div className="text-3xl font-bold">{result.rating}/100</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Avg Form</h3>
          <div className="text-3xl font-bold">{result.avgForm.toFixed(2)}</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Squad Value (est)</h3>
          <div className="text-3xl font-bold">£{result.value.toFixed(1)}m</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Captain Pick</h3>
        <div className="font-semibold">{result.captain?.web_name}</div>
        <div className="text-sm opacity-80">
          {result.captain ? `Form ${result.captain.form} · PPG ${result.captain.ppg} · FDR ${result.captain.fdr}` : "No data"}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Areas to Improve</h3>
        <ul className="list-disc ml-5 space-y-1">
          {result.issues.length ? result.issues.map((m,i)=>(<li key={i}>{m}</li>)) : <li>No major issues detected.</li>}
        </ul>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Transfer Suggestions (Top 10 fits)</h3>
        <ul className="list-disc ml-5 space-y-1">
          {result.suggestions.slice(0,10).map((s,i)=>(<li key={i}>{s}</li>))}
        </ul>
      </div>
    </div>
  );
}
