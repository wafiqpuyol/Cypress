"use server";

import db from "./db";
import { workspaces, folders, files, users } from "../../../migrations/schema";
import { Folder, Workspace } from "./schema-type";
import { and, eq, notExists } from "drizzle-orm";
import { collaborators } from "@/lib/supabase/schema";

export const findFirstWorkspace = async (userId: string) => {
  try {
    const query = await db.query.workspaces.findFirst({
      where: (workspace, { eq }) => eq(workspace.workspaceOwner, userId),
    });
    if (!query) return { data: null, error: null };
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const userSubscriptionStatus = async (userId: string) => {
  try {
    const query = await db.query.subscriptions.findFirst({
      where: (subscription, { eq }) => eq(subscription.id, userId),
    });
    if (!query) return { data: null, error: null };
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const createWorkspace = async (workspace: Workspace) => {
  try {
    const query = await db
      .insert(workspaces)
      .values(workspace)
      .returning();

    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
export const getFolders = async (workspaceId: string) => {
  try {
    const query = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getPrivateWorkspaces = async (userId: string) => {
  try {
    const query = (await db
      .select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(workspaces)
      .where(
        and(
          notExists(
            db
              .select()
              .from(collaborators)
              .where(eq(collaborators.workspaceId, workspaces.id))
          ),
          eq(workspaces.workspaceOwner, userId)
        )
      )) as Workspace[];
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  try {
    const query = await db
      .select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(users)
      .innerJoin(collaborators, eq(users.id, collaborators.userId))
      .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
      .where(eq(users.id, userId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];
  try {
    const query = await db
      .selectDistinct({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(workspaces)
      .orderBy(workspaces.createdAt)
      .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
      .where(eq(workspaces.workspaceOwner, userId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getFiles = async (folderId: string) => {
  try {
    const results = await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId));
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
};
