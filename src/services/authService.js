import axios from "axios";

const API = "http://localhost:4000/api/users";

export const loginRequest = (data) => {
  return axios.post(`${API}/login`, data);
};
