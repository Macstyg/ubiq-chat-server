const activeUsers = new Map<string, boolean>();

export const checkAndAddUser = (userName: string) => {
  if (!activeUsers.has(userName)) {
    activeUsers.set(userName, true);
    return true;
  }
  return false;
};

export const removeUserFromActive = (userName: string) => {
  activeUsers.delete(userName);
};
