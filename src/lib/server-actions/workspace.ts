"use server";

import { Workspace } from "../supabase/schema-type";
import { createWorkspace } from "../supabase/queries";

export const createWorkspaceAction = async (
  userId: string,
  logo: string | null,
  icon: string,
  workspaceId: string,
  workspaceName: string
) => {
  const newWorkspace: Workspace = {
    data: null,
    createdAt: new Date().toISOString(),
    iconId: icon,
    id: workspaceId,
    inTrash: "",
    title: workspaceName,
    workspaceOwner: userId,
    logo: logo,
    bannerUrl: "",
  };
  let { data, error } = await createWorkspace(newWorkspace);
  type NewWorkSpace = Workspace;
  type ReturnedData = {
    data: NewWorkSpace;
    error: any | null;
  };
  if (data) {
    let newWorkspaceData = {} as NewWorkSpace;
    for (const [key, value] of data.entries()) {
      newWorkspaceData = value;
    }
    data = newWorkspaceData;
    return { data, error: null } as unknown as ReturnedData;
  }
  return { data, error };
};
