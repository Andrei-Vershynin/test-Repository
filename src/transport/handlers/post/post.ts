import { Request, Response, type RequestHandler } from 'express';
import { Service } from '../../../services/post.types.ts';
import { CreatePostDto, PostResponseDto } from '../../dto/post.dto.ts';
import { ErrorResponseDto } from '../../dto/error.ts';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';


const POSITIVE_INTEGER_REGEX = /^\d+$/;

export interface PostHandlers {
  create(arg0: string, requireAuth: RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, create: any): unknown;
  getById(arg0: string, getById: any): unknown;
  getAll(arg0: string, getAll: any): unknown;
  getPostsHandler(
    req: Request,
    res: Response<PostResponseDto[] | ErrorResponseDto>
  ): Promise<unknown>;
  getPostByIdHandler(
    req: Request<{ id: string }>,
    res: Response<PostResponseDto | ErrorResponseDto>
  ): Promise<unknown>;
  createPostHandler(
    req: Request<{}, PostResponseDto | ErrorResponseDto, Partial<CreatePostDto>>,
    res: Response<PostResponseDto | ErrorResponseDto>
  ): Promise<unknown>;
}

export function createPostHandlers(service: Service): PostHandlers {
  async function getPostsHandler(
    req: Request,
    res: Response<PostResponseDto[] | ErrorResponseDto>
  ) {
    const { category, take } = req.query as { category?: unknown; take?: unknown };

    if (category !== undefined && typeof category !== 'string') {
      return res.status(422).json({ message: 'Query parameter "category" must be a string' });
    }

    if (take !== undefined && (typeof take !== 'string' || !POSITIVE_INTEGER_REGEX.test(take) || Number(take) <= 0)) {
      return res.status(422).json({ message: 'Query parameter "take" must be a positive integer' });
    }

    const posts = await service.getPosts(category, take ? Number(take) : undefined);

    return res.status(200).json(posts);
  }

  async function getPostByIdHandler(
    req: Request<{ id: string }>,
    res: Response<PostResponseDto | ErrorResponseDto>
  ) {
    const { id } = req.params;

    if (!POSITIVE_INTEGER_REGEX.test(id)) {
      return res.status(422).json({ message: 'Route parameter "id" must be a positive integer' });
    }

    const post = await service.getPost(Number(id));

    if (!post) {
      return res.status(404).json({ message: `Post with id ${id} not found` });
    }

    return res.status(200).json(post);
  }

  async function createPostHandler(
    req: Request<{}, PostResponseDto | ErrorResponseDto, Partial<CreatePostDto>>,
    res: Response<PostResponseDto | ErrorResponseDto>
  ) {
    const body = req.body || {};
    const { title, content, author, category } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(422).json({ message: 'Field "title" is required and must be a non-empty string' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(422).json({ message: 'Field "content" is required and must be a non-empty string' });
    }

    if (author !== undefined && typeof author !== 'string') {
      return res.status(422).json({ message: 'Field "author" must be a string' });
    }

    if (category !== undefined && typeof category !== 'string') {
      return res.status(422).json({ message: 'Field "category" must be a string' });
    }

    const newPost = await service.createPost({ title, content, author, category });

    return res.status(201).json(newPost);
  }

  return { getPostsHandler, getPostByIdHandler, createPostHandler };
}