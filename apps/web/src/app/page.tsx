"use client";

import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to default language landing
  redirect("/en");
}
