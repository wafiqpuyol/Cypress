"use server";

import db from "./db";

export const findFirstWorkspace = async (userId: string) => {
  try {
    const queryObj = await db.query.workspaces.findFirst({
      where: (workspace, { eq }) => eq(workspace.workspaceOwner, userId),
    });
    if (!queryObj) return { data: null, error: null };
    return { data: queryObj, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const userSubscriptionStatus = async (userId: string) => {
  try {
    const queryObj = await db.query.subscriptions.findFirst({
      where: (subscription, { eq }) => eq(subscription.id, userId),
    });
    if (!queryObj) return { data: null, error: null };
    return { data: queryObj, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
