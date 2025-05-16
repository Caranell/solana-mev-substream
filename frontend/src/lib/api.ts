import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getBundles = async ({
  period,
  mevType,
  // // orderBy,
  // orderDirection,
}: {
  period: string;
  mevType: string;
  // orderBy?: string;
  // orderDirection?: string;
}) => {
  const response = await axios.get(`${API_URL}/bundles`, {
    params: {
      period,
      mevType,
      // orderBy,
      // orderDirection,
    },
  });

  return response.data;
};

export const getStatistics = async ({ period, mevType }: { period: string; mevType: string }) => {
  const response = await axios.get(`${API_URL}/statistics`, {
    params: {
      period,
      mevType,
    },
  });

  return response.data;
};
