import type { APIRoute } from "astro";
import { getAllCards, getIndividuals } from "../../db";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getAllCards()), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json();
  if (Array.isArray(payload) && payload.every((s) => typeof s === "string")) {
    return new Response(JSON.stringify(getIndividuals(payload)), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(null, {
    status: 400,
    statusText: "Not found",
  });
};
