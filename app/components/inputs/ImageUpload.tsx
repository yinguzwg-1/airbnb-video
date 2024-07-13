/* eslint-disable @next/next/no-img-element */
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";
import ClientOnly from "../ClientOnly";

declare global {
  var cloudinary: any;
}

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}
const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const handleUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url);
    },
    [onChange]
  );
  return (
    <ClientOnly>
      <CldUploadWidget
        uploadPreset="aep9objy"
        options={{
          maxFiles: 1,
        }}
        onUpload={handleUpload}
      >
        {({ open }) => {
          return (
            <div
              onClick={() => open?.()}
              className="
              relative
              cursor-pointer
              hover:opacity-70
              transition
              border-dashed
              border-2
              p-20
              border-neutral-300
              flex
              flex-col
              justify-center
              items-center
              gap-4
              text-neutral-600
            "
            >
              <TbPhotoPlus size={50} />
              <div className="font-semibold text-lg">Click to upload</div>
              {value && (
                <div className="absolute inset-0 w-full h-full">
                  <img
                    alt="Upload"
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    src={value}
                  />
                </div>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
    </ClientOnly>
  );
};

export default ImageUpload;
