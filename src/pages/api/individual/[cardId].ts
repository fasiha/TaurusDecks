import type { APIRoute } from "astro";
import { getIndividuals, newCard } from "../../../db";

export const GET: APIRoute = ({ params }) => {
  const cardId = params.cardId;
  if (cardId) {
    return new Response(JSON.stringify(getIndividuals([cardId])), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return new Response(null, {
    status: 404,
    statusText: "Not found",
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const cardId = params.cardId;
  const payload = await request.json();
  if (cardId && payload && typeof payload === "object") {
    const { location, finish, notes } = payload;
    return new Response(
      JSON.stringify(newCard(cardId, location, finish, notes)),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  return new Response(null, {
    status: 404,
    statusText: "Not found",
  });
};
