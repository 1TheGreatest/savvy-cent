import { handleError } from "@/lib/utils";
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
      setErrorMessage("Error fetching data");
      handleError(error, "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
