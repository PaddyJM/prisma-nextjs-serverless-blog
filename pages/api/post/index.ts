import client from "db/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { title, content } = req.body;

  const session = await getSession({ req });
  const result = await client.post.create({
    data: {
      title,
      content,
      author: {
        connect: {
          email: session?.user?.email ?? undefined,
        },
      },
    },
  });
  res.json(result);
}
