import {
  postRide,
  registerUser,
  requestRideNow,
  submitRating,
  submitReport,
} from "@/app/actions";
import {
  contributionCapInCents,
  insuranceGuidance,
  platformDisclaimer,
} from "@/lib/legal";
import { prisma } from "@/lib/prisma";
import { coreRoutes } from "@/lib/routes";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedRoute = typeof params.routeKey === "string" ? params.routeKey : "";
  const selectedDate =
    typeof params.departureDate === "string" ? params.departureDate : "";
  const notice = typeof params.notice === "string" ? params.notice : "";

  const rides = await prisma.ride.findMany({
    where: {
      ...(selectedRoute ? { routeKey: selectedRoute } : {}),
      ...(selectedDate
        ? {
            departureAt: {
              gte: new Date(`${selectedDate}T00:00:00`),
              lt: new Date(`${selectedDate}T23:59:59`),
            },
          }
        : {}),
    },
    include: {
      driver: {
        include: {
          ratingsReceived: true,
          driverVerification: true,
        },
      },
      ratings: true,
      reports: true,
    },
    orderBy: [{ departureAt: "asc" }],
    take: 25,
  });

  const recentRideNow = await prisma.rideNowRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Share spare seats across NL</h1>
        <p className="mt-2 text-slate-700">
          SpareSeat helps people share seats on trips they are already taking.
          Payments happen directly between riders and drivers.
        </p>
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {platformDisclaimer}
        </p>
        <p className="mt-2 text-sm text-slate-700">{insuranceGuidance}</p>
        {notice ? (
          <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Create or update account</h2>
          <p className="mt-1 text-sm text-slate-700">
            Phone verification is required for all users. Driver profile requires
            license upload path and insurance confirmation.
          </p>
          <form action={registerUser} className="mt-4 grid gap-3">
            <input
              name="fullName"
              required
              placeholder="Full name"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              name="phone"
              required
              placeholder="Phone"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              name="role"
              className="rounded-lg border border-slate-300 px-3 py-2"
              defaultValue="RIDER"
            >
              <option value="RIDER">Rider</option>
              <option value="DRIVER">Driver</option>
              <option value="BOTH">Both</option>
            </select>
            <input
              name="licensePhotoPath"
              placeholder="Driver license photo path"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="insuranceConfirmed" />
              I confirm my auto policy supports cost sharing rides
            </label>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              Save account
            </button>
          </form>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Post a ride</h2>
          <p className="mt-1 text-sm text-slate-700">
            Suggested contribution is capped by route distance to support cost
            recovery rules.
          </p>
          <form action={postRide} className="mt-4 grid gap-3">
            <input
              name="phone"
              required
              placeholder="Driver phone"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              name="routeKey"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select route</option>
              {coreRoutes.map((route) => (
                <option key={route.key} value={route.key}>
                  {route.from} to {route.to} cap ${" "}
                  {(contributionCapInCents(route.distanceKm) / 100).toFixed(2)}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="departureDate"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                type="time"
                name="departureTime"
                required
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="seatsAvailable"
                required
                min={1}
                max={6}
                defaultValue={1}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                name="suggestedContributionDollars"
                required
                min={0}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Suggested contribution"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="isImmediate" />
              Mark as Ride Now listing
            </label>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              Publish ride
            </button>
          </form>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Find a ride</h2>
          <form className="mt-4 grid gap-3" method="get">
            <select
              name="routeKey"
              defaultValue={selectedRoute}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">All core routes</option>
              {coreRoutes.map((route) => (
                <option key={route.key} value={route.key}>
                  {route.from} to {route.to}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="departureDate"
              defaultValue={selectedDate}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              Search scheduled rides
            </button>
          </form>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Ride Now request</h2>
          <form action={requestRideNow} className="mt-4 grid gap-3">
            <input
              name="fullName"
              placeholder="Full name"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              name="phone"
              placeholder="Phone"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              name="routeKey"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select route</option>
              {coreRoutes.map((route) => (
                <option key={route.key} value={route.key}>
                  {route.from} to {route.to}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="seatsNeeded"
              min={1}
              max={4}
              defaultValue={1}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white"
            >
              Submit Ride Now request
            </button>
          </form>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Scheduled rides</h2>
        <div className="mt-4 grid gap-4">
          {rides.length === 0 ? (
            <p className="text-sm text-slate-600">No rides found for this filter.</p>
          ) : (
            rides.map((ride) => {
              const averageRating = ride.driver.ratingsReceived.length
                ? ride.driver.ratingsReceived.reduce((sum, rating) => sum + rating.stars, 0) /
                  ride.driver.ratingsReceived.length
                : null;

              return (
                <article
                  key={ride.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">
                      {ride.routeFrom} to {ride.routeTo}
                    </h3>
                    <span className="text-sm text-slate-600">
                      {new Date(ride.departureAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    Driver {ride.driver.fullName} · Seats {ride.seatsAvailable} ·
                    Suggested contribution ${(ride.suggestedContributionCents / 100).toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Driver status {ride.driver.driverVerification?.status ?? "PENDING"} ·
                    Average rating {averageRating ? averageRating.toFixed(1) : "No ratings yet"}
                  </p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <form action={submitRating} className="grid gap-2 rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold">Leave rating</p>
                      <input type="hidden" name="rideId" value={ride.id} />
                      <input type="hidden" name="toUserId" value={ride.driver.id} />
                      <input
                        name="fromPhone"
                        placeholder="Your phone"
                        required
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="number"
                        name="stars"
                        min={1}
                        max={5}
                        defaultValue={5}
                        required
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <textarea
                        name="comment"
                        placeholder="Optional comment"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                      >
                        Save rating
                      </button>
                    </form>

                    <form action={submitReport} className="grid gap-2 rounded-lg bg-rose-50 p-3">
                      <p className="text-sm font-semibold">Report ride issue</p>
                      <input type="hidden" name="rideId" value={ride.id} />
                      <input type="hidden" name="reportedUserId" value={ride.driver.id} />
                      <input
                        name="reporterPhone"
                        placeholder="Your phone"
                        required
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <select
                        name="type"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="NO_SHOW">No show</option>
                        <option value="UNSAFE_BEHAVIOR">Unsafe behavior</option>
                        <option value="FRAUDULENT_LISTING">Fraudulent listing</option>
                      </select>
                      <textarea
                        name="details"
                        placeholder="Optional details"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-rose-700 px-3 py-2 text-sm text-white"
                      >
                        Submit report
                      </button>
                    </form>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Recent Ride Now requests</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700">
          {recentRideNow.length === 0 ? (
            <li>No active Ride Now requests.</li>
          ) : (
            recentRideNow.map((request) => (
              <li key={request.id} className="rounded-lg bg-slate-100 p-2">
                {request.routeFrom} to {request.routeTo} · Seats {request.seatsNeeded} ·
                {" "}
                {new Date(request.createdAt).toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
