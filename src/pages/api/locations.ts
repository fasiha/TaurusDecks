import type { APIRoute } from "astro";
import { getLocations } from "../../db";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getLocations()), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
