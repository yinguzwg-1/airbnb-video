import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authoptions";

export default async function getSession() {
  return await getServerSession(authOptions);
}
