export const revalidate = 3600;

export default function AboutPage() {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">About SpareSeat</h1>
      <p className="mt-3 text-slate-700">
        SpareSeat is a peer to peer ride sharing platform for Newfoundland and
        Labrador. The service supports cost sharing on trips people are already
        taking.
      </p>
      <p className="mt-3 text-slate-700">
        SpareSeat does not process trip payments inside the app. Riders and
        drivers settle contribution directly.
      </p>
      <p className="mt-3 text-slate-700">
        Early route focus includes Corner Brook and St. John&apos;s, St. John&apos;s and
        Deer Lake, and St. John&apos;s and Gander.
      </p>
    </article>
  );
}
