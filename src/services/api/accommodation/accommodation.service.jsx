import axios from "axios";
import AuthHeader from "../../common/AuthHeader";
const BASE_URL = import.meta.env.VITE_BASE_URL;
 
 
const getPopularRoom = () => {
    return axios.get(`${BASE_URL}/api/accommodation/popular`);
};
 
const getPromotion = () => {
    return axios.get(`${BASE_URL}/api/accommodation/promotion`);
};
 
const getAll = async () => {
    return await axios.get(`${BASE_URL}/api/accommodation`,
        // { headers: AuthHeader() }
    );
};
 
const getSearch = async (checkIn, checkOut, adults, children) => {
    console.log("getSearch", checkIn, checkOut, adults, children);
    return await axios.get(`${BASE_URL}/api/accommodation/search`, {
        params: {
            checkIn,
            checkOut,
            adults,
            children
        }
    });
}
 
const getAvailableRooms = (formattedCheckIn, formattedCheckOut) => {
  return axios.get(`${BASE_URL}/api/accommodation/available`, {
    params: {
      formattedCheckIn,
      formattedCheckOut
    }
  });
}
 
const AccommodationService = {
    getPopularRoom,
    getPromotion,
    getAll,
    getSearch,
    getAvailableRooms
}
 
export default AccommodationService;