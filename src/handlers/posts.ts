import type { Request, Response } from "express";

type PostService = {
  create: (input: {
    title: string;
    content: string;
    category: string;
    authorId: string;
  }) => Promise<unknown>;
};

export const createPostHandlers = (service: PostService) => ({
  create: async (req: Request, res: Response) => {
    const { title, content, category } = req.body;
    const post = await service.create({
      title,
      content,
      category,
      authorId: res.locals.userId,
    });
    res.status(201).json(post);
  },
});