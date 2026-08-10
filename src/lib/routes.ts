export type RouteOption = {
  key: string;
  from: string;
  to: string;
  distanceKm: number;
};

export const coreRoutes: RouteOption[] = [
  {
    key: "corner-brook-st-johns",
    from: "Corner Brook",
    to: "St. John's",
    distanceKm: 690,
  },
  {
    key: "st-johns-deer-lake",
    from: "St. John's",
    to: "Deer Lake",
    distanceKm: 650,
  },
  {
    key: "st-johns-gander",
    from: "St. John's",
    to: "Gander",
    distanceKm: 335,
  },
];

export function getRouteByKey(routeKey: string) {
  return coreRoutes.find((route) => route.key === routeKey);
}
