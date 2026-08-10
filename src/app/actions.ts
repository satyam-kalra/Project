"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DRIVER_POST_LIMITS, normalizeContributionInCents } from "@/lib/legal";
import { prisma } from "@/lib/prisma";
import { getRouteByKey } from "@/lib/routes";

function fail(message: string): never {
  redirect(`/?notice=${encodeURIComponent(message)}`);
}

export async function registerUser(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "RIDER");
  const insuranceConfirmed = formData.get("insuranceConfirmed") === "on";
  const licensePhotoPath = String(formData.get("licensePhotoPath") ?? "").trim();

  if (!fullName || !phone) {
    return fail("Name and phone are required.");
  }

  const isDriverRole = role === "DRIVER" || role === "BOTH";

  if (isDriverRole && !licensePhotoPath) {
    return fail("Driver license photo path is required for drivers.");
  }

  const user = await prisma.user.upsert({
    where: { phone },
    create: {
      fullName,
      phone,
      role: role === "DRIVER" || role === "BOTH" ? role : "RIDER",
      phoneVerified: true,
      insuranceConfirmed,
    },
    update: {
      fullName,
      role: role === "DRIVER" || role === "BOTH" ? role : "RIDER",
      phoneVerified: true,
      insuranceConfirmed,
    },
  });

  if (isDriverRole) {
    await prisma.driverVerification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        licensePhotoPath,
      },
      update: {
        licensePhotoPath,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      metadata: JSON.stringify({ role }),
    },
  });

  revalidatePath("/");
  redirect("/?notice=Account saved. Phone is marked verified for MVP demo use.");
}

export async function postRide(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const routeKey = String(formData.get("routeKey") ?? "").trim();
  const departureDate = String(formData.get("departureDate") ?? "");
  const departureTime = String(formData.get("departureTime") ?? "");
  const seatsAvailable = Number(formData.get("seatsAvailable") ?? 0);
  const suggestedContributionDollars = Number(
    formData.get("suggestedContributionDollars") ?? 0,
  );
  const isImmediate = formData.get("isImmediate") === "on";

  if (!phone || !routeKey || !departureDate || !departureTime) {
    return fail("Please complete all ride fields.");
  }

  const route = getRouteByKey(routeKey);
  if (!route) {
    return fail("Route was not found.");
  }

  const driver = await prisma.user.findUnique({
    where: { phone },
    include: { driverVerification: true },
  });

  if (!driver) {
    return fail("Create an account before posting rides.");
  }

  const canDrive =
    (driver.role === "DRIVER" || driver.role === "BOTH") &&
    driver.phoneVerified &&
    driver.insuranceConfirmed &&
    driver.driverVerification;

  if (!canDrive) {
    return fail(
      "Driver profile must include verification and insurance confirmation.",
    );
  }

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const [todayCount, weekCount] = await Promise.all([
    prisma.ride.count({
      where: {
        driverId: driver.id,
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.ride.count({
      where: {
        driverId: driver.id,
        createdAt: { gte: startOfWeek },
      },
    }),
  ]);

  if (todayCount >= DRIVER_POST_LIMITS.perDay) {
    return fail("Daily posting limit reached for this driver account.");
  }

  if (weekCount >= DRIVER_POST_LIMITS.perWeek) {
    return fail("Weekly posting limit reached for this driver account.");
  }

  const contributionInCents = normalizeContributionInCents(
    Math.round(suggestedContributionDollars * 100),
    route.distanceKm,
  );

  const departureAt = new Date(`${departureDate}T${departureTime}:00`);
  if (Number.isNaN(departureAt.getTime())) {
    return fail("Departure date or time is invalid.");
  }

  const ride = await prisma.ride.create({
    data: {
      driverId: driver.id,
      routeFrom: route.from,
      routeTo: route.to,
      routeKey: route.key,
      distanceKm: route.distanceKm,
      departureAt,
      seatsAvailable: Math.max(1, Math.min(6, Math.floor(seatsAvailable || 1))),
      suggestedContributionCents: contributionInCents,
      isImmediate,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: driver.id,
      action: "RIDE_POSTED",
      entityType: "Ride",
      entityId: ride.id,
      metadata: JSON.stringify({ routeKey }),
    },
  });

  revalidatePath("/");
  redirect("/?notice=Ride posted.");
}

export async function requestRideNow(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const routeKey = String(formData.get("routeKey") ?? "").trim();
  const seatsNeeded = Number(formData.get("seatsNeeded") ?? 1);

  if (!phone || !fullName || !routeKey) {
    return fail("Ride Now requires name, phone, and route.");
  }

  const route = getRouteByKey(routeKey);
  if (!route) {
    return fail("Route was not found.");
  }

  const user = await prisma.user.upsert({
    where: { phone },
    create: {
      fullName,
      phone,
      role: "RIDER",
      phoneVerified: true,
    },
    update: {
      fullName,
      role: "RIDER",
      phoneVerified: true,
    },
  });

  await prisma.rideNowRequest.create({
    data: {
      riderId: user.id,
      routeFrom: route.from,
      routeTo: route.to,
      routeKey,
      seatsNeeded: Math.max(1, Math.min(4, Math.floor(seatsNeeded || 1))),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "RIDE_NOW_REQUESTED",
      entityType: "RideNowRequest",
      entityId: route.key,
      metadata: JSON.stringify({ seatsNeeded }),
    },
  });

  revalidatePath("/");
  redirect("/?notice=Ride Now request saved.");
}

export async function submitRating(formData: FormData) {
  const rideId = String(formData.get("rideId") ?? "").trim();
  const fromPhone = String(formData.get("fromPhone") ?? "").trim();
  const toUserId = String(formData.get("toUserId") ?? "").trim();
  const stars = Number(formData.get("stars") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!rideId || !fromPhone || !toUserId) {
    return fail("Rating requires ride, your phone, and driver profile.");
  }

  if (stars < 1 || stars > 5) {
    return fail("Rating must be between 1 and 5 stars.");
  }

  const fromUser = await prisma.user.findUnique({ where: { phone: fromPhone } });
  if (!fromUser) {
    return fail("Create an account before leaving a rating.");
  }

  await prisma.rating.upsert({
    where: {
      rideId_fromUserId_toUserId: {
        rideId,
        fromUserId: fromUser.id,
        toUserId,
      },
    },
    create: {
      rideId,
      fromUserId: fromUser.id,
      toUserId,
      stars,
      comment: comment || null,
    },
    update: {
      stars,
      comment: comment || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: fromUser.id,
      action: "RATING_SUBMITTED",
      entityType: "Ride",
      entityId: rideId,
    },
  });

  revalidatePath("/");
  redirect("/?notice=Rating saved.");
}

export async function submitReport(formData: FormData) {
  const rideId = String(formData.get("rideId") ?? "").trim();
  const reporterPhone = String(formData.get("reporterPhone") ?? "").trim();
  const reportedUserId = String(formData.get("reportedUserId") ?? "").trim();
  const type = String(formData.get("type") ?? "NO_SHOW");
  const details = String(formData.get("details") ?? "").trim();

  if (!rideId || !reporterPhone || !reportedUserId) {
    return fail("Report requires ride id, your phone, and user target.");
  }

  const reporter = await prisma.user.findUnique({ where: { phone: reporterPhone } });
  if (!reporter) {
    return fail("Create an account before submitting reports.");
  }

  await prisma.report.create({
    data: {
      rideId,
      reporterId: reporter.id,
      reportedUserId,
      type:
        type === "UNSAFE_BEHAVIOR" || type === "FRAUDULENT_LISTING"
          ? type
          : "NO_SHOW",
      details: details || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: reporter.id,
      action: "REPORT_SUBMITTED",
      entityType: "Ride",
      entityId: rideId,
      metadata: JSON.stringify({ type }),
    },
  });

  revalidatePath("/");
  redirect("/?notice=Report submitted for moderation review.");
}
