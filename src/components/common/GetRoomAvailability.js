import dayjs from 'dayjs';
import AccommodationService from '../../services/api/accommodation/accommodation.service';

const GetRooomAvailability = async (checkInDate, checkOutDate) => {
  try {
    const formattedCheckIn = dayjs(checkInDate).format('YYYY-MM-DD');
    const formattedCheckOut = dayjs(checkOutDate).format('YYYY-MM-DD');

    if (!formattedCheckIn || !formattedCheckOut) {
      console.error('Invalid dates');
      return {};
    }

    const res = await AccommodationService.getAvailability(
      formattedCheckIn,
      formattedCheckOut
    );

    const data = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Object.values(res.data || {});

    const availabilityMap = {};
    data.forEach(item => {
      availabilityMap[item.accommodationId] = item.availableRooms;
    });

    return availabilityMap; // return ค่าออกไปให้ใช้
  } catch (err) {
    console.error('Error fetching availability:', err);
    return {}; // กรณี error ก็ return empty
  }
};

export default GetRooomAvailability;
