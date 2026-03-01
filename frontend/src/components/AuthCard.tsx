"use client";

import Image from "next/image";

type AuthCardProps = {
  title: string;
  illustration: string;
  children: React.ReactNode;
};

export function AuthCard({ title, illustration, children }: AuthCardProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="mb-8">
        <Image
          src={illustration}
          alt=""
          width={140}
          height={140}
          className="object-contain"
        />
      </div>
      <h1 className="mb-10 text-center text-3xl font-bold text-[#704214]" style={{ fontFamily: "Georgia, serif" }}>
        {title}
      </h1>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
