'use client'

import Dashboard from "./dashboard/page";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  return <Dashboard key={user?.id} />
}
