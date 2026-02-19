import axios from "axios";

export const loginUser = async (data) => {
  return axios.post("http://127.0.0.1:8081/api/login", data);
};
