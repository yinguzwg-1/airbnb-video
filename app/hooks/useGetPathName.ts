import { usePathname } from "next/navigation";

export const useGetPathName = () => {
  const pathname = usePathname();
  console.log(pathname);
  return pathname;
};