"use client";

import Container from "../Container";

import { CategoryBox } from "..";
import { usePathname, useSearchParams } from "next/navigation";
import { CategoriesList } from "@/app/common/const";

const Categories = () => {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  if (!isMainPage) {
    return null;
  }
  return (
    <Container>
      <div
        className="
        pt-4
        flex
        flex-row
        items-center
        justify-between
        overflow-x-auto
      "
      >
        {CategoriesList.map((item) => (
          <CategoryBox
            selected={category === item.label}
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
