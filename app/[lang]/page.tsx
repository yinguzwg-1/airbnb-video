"use client";

import { redirect, useRouter } from "next/navigation";

import { Language } from "../i18n";

interface HomePageProps {
  params: { lang: Language };
}

export default function HomePage({ params }: HomePageProps) {
  redirect(`/${params.lang}/media`);
} 