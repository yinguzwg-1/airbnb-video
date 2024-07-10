/* eslint-disable @next/next/no-img-element */
"use client";

import { SafeUser } from "@/app/common/type";
import useCountries from "@/app/hooks/useCountries";
import Heading from "../Heading";
import HeartButton from "../HeartButton";

interface ListingHeadProps {
  title: string;
  locationValue: string;
  imageSrc: string;
  id: string;
  currentUser?: SafeUser | undefined;
}

const ListingHead: React.FC<ListingHeadProps> = ({
  title,
  locationValue,
  imageSrc,
  id,
  currentUser,
}) => {
  const { getByValue } = useCountries();
  const location = getByValue(locationValue);
  return (
    <>
      <Heading
        title={title}
        subtitle={`${location?.region}, ${location?.label}`}
      />
      <div
        className="w-full
          h-[60vh]
          overflow-hidden
          rounded-xl
          relative
        "
      >
        <img alt="Image" src={imageSrc} className="object-cover w-full" />
        <div
          className="
          absolute
          top-5
          right-5
          
        "
        >
          <HeartButton currentUser={currentUser} listingId={id} />
        </div>
      </div>
    </>
  );
};

export default ListingHead;
