import React, { useEffect, useState } from "react";
import AccommodationService from "../../services/api/accommodation/accommodation.service";
import AccommodationCard from "./AccommodationCard";
import { Spinner } from "react-bootstrap";
import GetRoomAvailability from "../common/GetRoomAvailability";
import dayjs from 'dayjs';
import 'dayjs/locale/th';

const Promotion = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availabilityData, setAvailabilityData] = useState({});

    // Fetch availability data when checkInDate or checkOutDate changes
    useEffect(() => {
        const checkInDate = dayjs().add(1, 'day').toDate();
        const checkOutDate = dayjs().add(2, 'day').toDate();

        const fetchData = async () => {
            if (checkInDate && checkOutDate) {
                const result = await GetRoomAvailability(checkInDate, checkOutDate);
                setAvailabilityData(result);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await AccommodationService.getPromotion();
            setPromotions(res?.data || []);
        } catch (error) {
            console.error("Error fetching promotions:", error);
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
                    {promotions.length > 0 ? (
                        promotions.map((promotion) => (
                            <AccommodationCard
                                key={promotion.id}
                                accommodation={promotion}
                                availabilityRooms={availabilityData[promotion.id] || 0}
                            />
                        ))
                    ) : (
                        <div className="text-center col-12">
                            <p className="text-danger">
                                ไม่สามารถโหลดข้อมูลโปรโมชั่นได้
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Promotion;