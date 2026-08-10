export const revalidate = 3600;

export default function TrustPage() {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">Trust and Safety</h1>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
        <li>Phone verification is required for every account.</li>
        <li>Driver listings require a license photo path and insurance confirmation.</li>
        <li>Driver posting limits help keep activity in a cost sharing range.</li>
        <li>Users can report no show, unsafe behavior, and fraudulent listings.</li>
        <li>
          SpareSeat is a matching platform. Users are responsible for identity checks,
          licenses, insurance, and local law compliance.
        </li>
      </ul>
    </article>
  );
}
