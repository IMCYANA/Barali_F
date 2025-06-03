import dayjs from 'dayjs';
import AccommodationService from '../../services/api/accommodation/accommodation.service';
 
const GetRoomAvailability = async (checkInDate, checkOutDate) => {
  try {
    const formattedCheckIn = dayjs(checkInDate).format('YYYY-MM-DD');
    const formattedCheckOut = dayjs(checkOutDate).format('YYYY-MM-DD');
 
    if (!formattedCheckIn || !formattedCheckOut) {
      console.error('Invalid dates');
      return {};
    }
 
    const res = await AccommodationService.getAvailableRooms(
      formattedCheckIn,
      formattedCheckOut
    );
 
    const availableByType = res?.data?.availableByType;
 
    if (!Array.isArray(availableByType)) {
      console.warn('⚠️ No valid availableByType array found');
      return {};
    }
 
    const availabilityMap = availableByType.reduce((map, item) => {
      map[item.typeId] = item.availableRooms;
      return map;
    }, {});
 
    // console.log("✅ availabilityMap", availabilityMap);
 
    return availabilityMap;
  } catch (err) {
    console.error('Error fetching availability:', err);
    return {};
  }
};
 
export default GetRoomAvailability;