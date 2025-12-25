import { apiFetch } from "./api"

// 🔹 Get all host requests
export const getHostRequests = async () => {
  return apiFetch("/admin/host-requests", {
    method: "GET",
  })
}

// 🔹 Get all approved hosts
export const getHosts = async () => {
  return apiFetch("/admin/hosts", {
    method: "GET",
  })
}
