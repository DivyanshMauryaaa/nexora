'use client';

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Props = {
  workspace: any;
  error?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ""
);

export default function WorkspaceClient({ workspace, error }: Props) {
  const { user } = useUser();
  const [title, setTitle] = useState(workspace.title);
  const [description, setDescription] = useState(workspace.description);

  if (error) {
    return <div>Error fetching workspace: {error}</div>;
  }

  if (workspace.user_id !== user?.id) {
    return (
      <div className="flex flex-col items-center justify-center mt-[30px]">
        <Image
          src={"/dog.jpg"}
          width={100}
          height={100}
          alt="Sorry... we couldn't find this workspace from your account"
        />
        Sorry... we couldn't find this workspace from your account
        <br />
        <Link href={"/workspaces"}>
          <button className="p-3 hover:text-blue-700 hover:underline rounded-lg border-gray-400 cursor-pointer">
            Your Workspaces
          </button>
        </Link>
      </div>
    );
  }

  const handleUpdate = async (field: string, value: string) => {
    const { error } = await supabase
      .from("workspaces")
      .update({ [field]: value })
      .eq("id", workspace.id);

    if (error) {
      console.error("Failed to update workspace:", error.message);
    } else {
      console.log(`Updated ${field}:`, value);
    }
  };

  return (
    <div className="p-4">
      <h1
        className="text-3xl font-bold outline-none"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const newTitle = e.currentTarget.textContent || '';
          setTitle(newTitle);
          handleUpdate("title", newTitle);
        }}
      >
        {title}
      </h1>
      <p
        className="text-gray-600 mt-2 outline-none"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const newDesc = e.currentTarget.textContent || '';
          setDescription(newDesc);
          handleUpdate("description", newDesc);
        }}
      >
        {description}
      </p>
    </div>
  );
}
