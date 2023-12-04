import type { APIRoute } from "astro";
import { deleteIndividual, getIndividuals, newUpdateCard } from "../../../db";
import { isFinish, isCondition } from "../../../interfaces";

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

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.cardId); // even though this is "cardId", it's actually the primary key row `id`
  if (isFinite(id)) {
    return new Response(JSON.stringify(deleteIndividual(id)));
  }
  return new Response(null, {
    status: 400,
    statusText: "Bad request",
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const cardId = params.cardId;
  const payload = await request.json();
  if (cardId && payload && typeof payload === "object") {
    const { location, finish, condition, notes, id } = payload;
    if (
      isFinish(finish) &&
      isCondition(condition) &&
      typeof location === "string"
    ) {
      return new Response(
        JSON.stringify(
          newUpdateCard({ cardId, location, finish, condition, notes, id })
        ),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }
  return new Response(null, {
    status: 404,
    statusText: "Not found",
  });
};
