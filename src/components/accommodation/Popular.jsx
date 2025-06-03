import { useEffect, useState } from "react";
import AccommodationService from "../../services/api/accommodation/accommodation.service";
import AccommodationCard from "./AccommodationCard";
import { Spinner } from "react-bootstrap";
import GetRoomAvailability from "../common/GetRoomAvailability";
import dayjs from 'dayjs';
import 'dayjs/locale/th';
 
 
const Popular = () => {
    const [populars, setPopulars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availabilityData, setAvailabilityData] = useState({});
 
    // Fetch availability data when checkInDate or checkOutDate changes
    useEffect(() => {
        const checkInDate = dayjs().add(1, 'day').toDate();
        const checkOutDate = dayjs().add(2, 'day').toDate();
 
        const fetchData = async () => {
            if (checkInDate && checkOutDate) {
                // console.log("📡 Fetching room availability", { checkInDate, checkOutDate });
                // console.log("📡 Fetching room availability", { checkInDate, checkOutDate });
                const result = await GetRoomAvailability(checkInDate, checkOutDate);
                // console.log("✅ Availability data:", result);
                // console.log("✅ Availability data:", result);
                setAvailabilityData(result);
            }
        };
 
 
        fetchData();
    }, []);
 
 
    useEffect(() => {
        fetchPopularAccommodations();
    }, []);
 
 
    const fetchPopularAccommodations = async () => {
        try {
            setLoading(true);
            const res = await AccommodationService.getPopularRoom();
            console.log(res);
            setPopulars(res?.data || []);
        } catch (error) {
            console.error("Error fetching popular accommodations:", error);
        } finally {
            setLoading(false);
        }
    };
 
 
    return (
        <div className="row">
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    {populars.length > 0 ? (
                        populars.map((acc) => (
                            <AccommodationCard
                                key={acc.id}
                                accommodation={acc}
                                availabilityRooms={availabilityData[acc.type_id] ?? 0}
                            />
                        ))
                    ) : (
                        <div className="text-center col-12">
                            <p className="text-danger">
                                ไม่สามารถโหลดข้อมูลห้องพักยอดนิยมได้
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
 
 
export default Popular;