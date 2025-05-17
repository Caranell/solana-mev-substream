import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getBundles = async ({
  period,
  mevType,
  limit = 50,
  orderBy = "profit",
  orderDirection = "desc",
}: {
  period: string;
  mevType: string;
  limit?: number;
  orderBy?: string;
  orderDirection?: string;
}) => {
  const response = await axios.get(`${API_URL}/bundles`, {
    params: {
      period,
      mevType,
      limit,
      orderBy,
      orderDirection,
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
