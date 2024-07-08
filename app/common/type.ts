import { Listing, User } from "@prisma/client";

export type CountrySelectValue = {
  flag: string;
  label: string;
  latlng: number[];
  region: string;
  value: string;
};

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};
export type SafeUser = Omit<
  User,
  "createdAt" | "updateAt" | "emailVerified"
> & {
  createdAt: string;
  updateAt: string;
  emailVerified: string | null;
};
