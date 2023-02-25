import client from "db/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const postId = req.query.id;
  const post = await client.post.update({
    where: { id: Number(postId) },
    data: {
      published: true,
    },
  });
  res.json(post);
}
