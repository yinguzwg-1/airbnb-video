import { usePathname } from "next/navigation";

const useLang = () => {
  const pathname = usePathname();
  const lang = pathname.split("/")[1];
  return lang || 'zh';
};

export default useLang;