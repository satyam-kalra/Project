import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const reports = await prisma.report.findMany({
    include: {
      ride: true,
      reporter: true,
      reportedUser: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">Moderation Queue</h1>
      <p className="mt-2 text-slate-700">
        This queue supports no show and safety report triage for Phase 1 launch.
      </p>
      <div className="mt-5 grid gap-3">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-600">No reports in queue.</p>
        ) : (
          reports.map((report) => (
            <section key={report.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold">{report.type}</p>
              <p className="text-sm text-slate-700">
                Ride {report.ride.routeFrom} to {report.ride.routeTo}
              </p>
              <p className="text-sm text-slate-700">
                Reporter {report.reporter.fullName} · Reported user {report.reportedUser.fullName}
              </p>
              <p className="text-sm text-slate-700">{report.details ?? "No extra details"}</p>
            </section>
          ))
        )}
      </div>
    </article>
  );
}
