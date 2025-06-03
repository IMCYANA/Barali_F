import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MakeBooking = async ( userId, roomIds, checkInDate, checkOutDate, adults, children, specialRequests, totalPrice) =>{
    return await axios.post(`${BASE_URL}/api/booking/make`,
        {
            userId,
            roomIds,
            checkInDate,
            checkOutDate,
            adults,
            children,
            specialRequests,
            totalPrice
        }
    );
}

const BookingService = {
    MakeBooking,
};

export default BookingService;
