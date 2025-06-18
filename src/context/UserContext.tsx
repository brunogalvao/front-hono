import { createContext, useContext, useState } from "react";
import type { UserProfile } from "@/model/user.model";

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser deve estar dentro de <UserProvider>");
  return context;
};
