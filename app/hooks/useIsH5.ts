import { useEffect, useState } from "react";

export const useIsH5 = () => {
  const [isH5, setIsH5] = useState(false);
  useEffect(() => {
    setIsH5(window.innerWidth < 768);
  }, []);
  return isH5;
};