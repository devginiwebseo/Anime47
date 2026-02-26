/**
 * Refine Data Provider for REST API
 */

import { DataProvider } from "@refinedev/core";

const API_URL = "/api/refine";

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const { current = 1, pageSize = 10 } = (pagination as any) || {};

    const params = new URLSearchParams({
      resource,
      current: current.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters && filters.length > 0) {
      params.append('filters', JSON.stringify(filters));
    }

    if (sorters && sorters.length > 0) {
      params.append('sorters', JSON.stringify(sorters));
    }

    const response = await fetch(`${API_URL}?${params}`);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Failed to fetch data');
    }

    return {
      data: json.data,
      total: json.total,
    };
  },

  getOne: async ({ resource, id }) => {
    const params = new URLSearchParams({
      resource,
      id: id.toString(),
    });

    const response = await fetch(`${API_URL}?${params}`);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Failed to fetch data');
    }

    return { data: json.data };
  },

  create: async ({ resource, variables }) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resource, variables }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Failed to create');
    }

    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const response = await fetch(API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resource, id, variables }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Failed to update');
    }

    return { data: json.data };
  },

  deleteOne: async ({ resource, id }) => {
    const params = new URLSearchParams({
      resource,
      id: id.toString(),
    });

    const response = await fetch(`${API_URL}?${params}`, {
      method: 'DELETE',
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || 'Failed to delete');
    }

    return { data: json.data };
  },

  getApiUrl: () => API_URL,

  getMany: async ({ resource, ids }) => {
    if (!ids) return { data: [] };
    const data = await Promise.all(
      ids.map((id) =>
        dataProvider.getOne({ resource, id }).then((res) => res.data)
      )
    );
    return { data: data as any };
  },
  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = `${url}?`;

    if (sorters && sorters.length > 0) {
      const sortQuery = {
        _sort: sorters[0].field,
        _order: sorters[0].order,
      };
      requestUrl = `${requestUrl}&${new URLSearchParams(sortQuery as any).toString()}`;
    }

    if (filters && filters.length > 0) {
      const filterQuery = {};
      filters.forEach((filter) => {
        // @ts-ignore
        filterQuery[filter.field] = filter.value;
      });
      requestUrl = `${requestUrl}&${new URLSearchParams(filterQuery as any).toString()}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${new URLSearchParams(query as any).toString()}`;
    }

    let body;
    if (payload) {
      body = JSON.stringify(payload);
    }

    // Handle method normalisation
    const httpMethod = (method || "get").toUpperCase();

    const response = await fetch(requestUrl, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: httpMethod !== "GET" && httpMethod !== "HEAD" ? body : undefined
    });

    const json = await response.json();

     if (!response.ok) {
        return Promise.reject({
            message: json.error || "Error",
            statusCode: response.status,
            ...json
        });
    }

    return {
      data: json,
    };
  },
};
