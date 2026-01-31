import { useCallback, useState } from "react";

export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus("pending");
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus("success");
      return response;
    } catch (error) {
      setError(error);
      setStatus("error");
      throw error;
    }
  }, [asyncFunction]);

  useState(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};
