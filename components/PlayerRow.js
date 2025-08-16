export default function PlayerRow({ p }) {
  return (
    <tr>
      <td>{p.web_name}</td>
      <td>{p.team_short_name}</td>
      <td>{p.element_type_name}</td>
      <td>{(p.now_cost/10).toFixed(1)}</td>
      <td>{p.form}</td>
      <td>{p.ppg}</td>
      <td>{p.is_home ? "vs" : "@"} {p.next_opponent || "-"}</td>
      <td>{p.fdr ?? "-"}</td>
    </tr>
  );
}
