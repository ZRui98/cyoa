import { FastifyInstance, FastifyRequest } from "fastify";
import { getAdventureSummaries } from "../api/db/user";

const routes = (app: FastifyInstance, _opts, next) => {

      next();
};

export default routes;