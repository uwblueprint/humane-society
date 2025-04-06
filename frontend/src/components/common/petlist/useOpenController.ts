import { useCallback, useState } from "react";

const useOpenController = (initialState: boolean) => {
  const [isOpen, setOpenState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setOpenState((state: boolean) => !state);
  }, [setOpenState]);

  return { isOpen, toggle };
};

export default useOpenController;
