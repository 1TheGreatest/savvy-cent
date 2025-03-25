import { useState } from "react";

const useFetch = (callback) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setErrorMessage] = useState("");

  const fn = async (...args) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await callback(...args);
      setData(response);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
