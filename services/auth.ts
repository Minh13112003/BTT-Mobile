import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export const login = (payload : any) =>{
    return apiService.post(urls.URL_Login, payload);
}

export const register = (payload : any) => {
    return apiService.post_form(urls.URL_Register, payload);
}

export const logout = () => {
    return apiService.post(urls.URL_Logout, {});
}