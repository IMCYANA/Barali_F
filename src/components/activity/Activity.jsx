import { useEffect, useState, useRef, useCallback } from "react";
import { Spinner, ButtonGroup, Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import ActivityService from "../../services/api/activity/activity.service";
import ActivityCard from "./activityCard";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3); // Default to 3 items
    const autoPlayIntervalRef = useRef(null);
    const slideSpeed = 5000;
    
    const maxIndex = Math.max(0, activities.length - itemsPerView);

    useEffect(() => {
        const handleResize = () => {
            // Always respect the user's choice between 3 or 4 items on larger screens
            if (window.innerWidth < 576) {
                setItemsPerView(1);
            } else if (window.innerWidth < 768) {
                setItemsPerView(2);
            } else {
                // On larger screens, keep the selected itemsPerView (3 or 4)
                setItemsPerView(prev => prev === 1 || prev === 2 ? 3 : prev);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        fetchActivities();
        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
        };
    }, []);

    const startAutoPlay = useCallback(() => {
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        autoPlayIntervalRef.current = setInterval(() => {
            setCurrentIndex(prevIndex => {
                if (prevIndex >= maxIndex) {
                    return 0;
                }
                return prevIndex + 1;
            });
        }, slideSpeed);
    }, [maxIndex]);

    useEffect(() => {
        if (activities.length > 0) {
            startAutoPlay();
        }
        
        return () => {
            if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
            }
        };
    }, [activities.length, startAutoPlay]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const res = await ActivityService.getAll();
            setActivities(res?.data || []);
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        if (currentIndex < maxIndex) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
        
        setTimeout(startAutoPlay, 2000);
    };

    const prevSlide = () => {
        if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
        }
        
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(maxIndex);
        }
        
        setTimeout(startAutoPlay, 2000);
    };

    return (
        <div className="row">
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    <div className="position-relative my-4">
                        <div className="container-fluid px-0">
                            <Row className="mx-0">
                                <Col xs={12} className="px-0">
                                    <div className="overflow-hidden position-relative">
                                        <Row
                                            className="flex-nowrap transition-transform"
                                            style={{
                                                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                                                transition: 'transform 300ms ease-in-out'
                                            }}
                                        >
                                            {activities.map((activity) => (
                                                <Col 
                                                    key={activity.id} 
                                                    xs={12} 
                                                    sm={6} 
                                                    md={4} 
                                                    lg={12 / itemsPerView}
                                                    className="px-2"
                                                >
                                                    <ActivityCard activity={activity} />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Navigation Buttons */}
                        {itemsPerView > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="position-absolute top-50 start-0 translate-middle-y bg-white p-2 rounded-circle shadow border-0 ms-2 d-none d-sm-block"
                                    style={{
                                        zIndex: 10,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <button
                                    onClick={nextSlide}
                                    className="position-absolute top-50 end-0 translate-middle-y bg-white p-2 rounded-circle shadow border-0 me-2 d-none d-sm-block"
                                    style={{
                                        zIndex: 10,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Mobile navigation buttons */}
                        {itemsPerView === 1 && (
                            <div className="d-flex justify-content-center mt-3 gap-3">
                                <button
                                    onClick={prevSlide}
                                    className="bg-white p-2 rounded-circle shadow border-0"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="bg-white p-2 rounded-circle shadow border-0"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default Activity;