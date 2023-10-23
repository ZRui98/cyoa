import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { ApiError } from '../../util/error';

export function isLoggedInAndAuthenticated(req: FastifyRequest, res: FastifyReply, done: HookHandlerDoneFunction) {
  let err: Error | undefined;

  if (!req.user) {
    err = new ApiError(401, 'Not logged in');
  } else if (!req.user.activated) {
    err = new ApiError(403, 'User must be activated first');
  }
  done(err);
}

export function isLoggedIn(req: FastifyRequest, res: FastifyReply, done: HookHandlerDoneFunction) {
  let err: Error | undefined;
  if (!req.user) {
    err = new ApiError(401, 'Not logged in');
  }
  done(err);
}
