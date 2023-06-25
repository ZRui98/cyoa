import { UserTable } from "../../models/User";

export const serializeUser = async (user: UserTable, req) => {
    return {name: user.name, activated: user.activated};
}

export const deserializeUser = async (session, req) => {
    return session;
}