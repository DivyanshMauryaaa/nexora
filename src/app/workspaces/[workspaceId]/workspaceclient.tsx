'use client';

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";


//Importing all the workspace pages
import Notes from "./(workspacePages)/notes/notes";
import Photos from "./(workspacePages)/photos/photos";
import Tasks from "./(workspacePages)/tasks/tasks";
import Documents from "./(workspacePages)/documents/document";
import Schedules from "./(workspacePages)/schedules/schedules";
import Reminders from "./(workspacePages)/reminders/reminders";
import Emails from "./(workspacePages)/emails/emails";

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
  const [currentPage, setCurrentPage] = useState<string | React.ReactNode>(<Tasks />);

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

  if (error) {
    return <div className="text-center text-red-600 font-bold text-2xl">Sorry we couldn't load your space, error:<p className="text-md font-[500]">{error}</p></div>;
  }

  if (workspace.user_id !== user?.id || !workspace || !workspace.title || !workspace.description) {
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

  return (
    <div className="p-4">
      <div className="heading">
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
      <br />
      <div className="border-b border-gray-400" />
      
      <div className="flex">

        <div className="w-[300px] h-[731px] border-r border-gray-400 p-4 md:block hidden">
          
            <div className="flex flex-col items-center">
              <div 
                onClick={() => setCurrentPage(<Tasks />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Tasks
              </div>
              <div 
                onClick={() => setCurrentPage(<Schedules />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Schedules
              </div>
              <div 
                onClick={() => setCurrentPage(<Notes />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Quick Notes
              </div>
              <div 
                onClick={() => setCurrentPage(<Documents />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Documents
              </div>
              <div 
                onClick={() => setCurrentPage(<Photos />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Photos
              </div>
              <div 
                onClick={() => setCurrentPage(<Reminders />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Reminders
              </div>
              <div 
                onClick={() => setCurrentPage(<Emails />)}
                className="w-[100%] text-center p-3 cursor-pointer rounded-lg text-lg hover:bg-blue-800 hover:text-white transition-ease-in duration-100">
                Emails
              </div>
              
            </div>

        </div>

        <div className="p-4">
          {currentPage}
        </div>

      </div>
    </div>
  );
}
