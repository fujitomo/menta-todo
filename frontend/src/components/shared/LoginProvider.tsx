import { createContext, FC, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

type ContextType = {
  setLogin: (value: boolean) => void;
  setLocalLogin: (value: boolean) => void;
  login: boolean;
  localLogin: boolean;
};

export const LoginContext = createContext<ContextType>({} as ContextType);

export const LoginProvider: FC<Props> = ({ children }) => {
  const [login, setLogin] = useState<boolean>(false);
  const [localLogin, setLocalLogin] = useState<boolean>(false);

  return (
    <LoginContext.Provider
      value={{ login, setLogin, localLogin, setLocalLogin }}
    >
      {children}
    </LoginContext.Provider>
  );
};
