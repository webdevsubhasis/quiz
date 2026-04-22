import axios from "axios";

export const loginUser = async (data) => {
  return axios.post("http://localhost:8081/api/login", data);
};
