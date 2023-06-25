import { Generated } from "kysely";

export interface UserProfileData {
    name: string,
    bio?: string,
}

export const AccountType = {
    Google: 'Google',
    Facebook: 'Facebook'
} as const;
export type AccountType = typeof AccountType[keyof typeof AccountType];

export interface UserData extends UserProfileData {
    email: string,
    accountType: AccountType,
    accountTypeId: string,
    activated: boolean
}

export interface UserTable extends UserData {
    id: Generated<number>
}