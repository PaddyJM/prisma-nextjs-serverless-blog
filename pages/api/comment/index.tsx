import client from "db/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { comment, id: postId } = req.body;

  const session = await getSession({ req });
  const result = await client.comment.create({
    data: {
      content: comment,
      author: {
        connect: {
          email: session?.user?.email ?? undefined,
        },
      },
      post: {
        connect: {
          id: postId,
        },
      },
    },
  });
  res.json(result);
}
