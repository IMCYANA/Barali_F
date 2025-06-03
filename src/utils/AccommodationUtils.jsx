// src/utils/AccommodationUtils.js

export const updateAccommodation = (newData) => {
  try {
    localStorage.setItem("selectedAccommodation", JSON.stringify(newData));
    window.dispatchEvent(new Event("accommodationChanged"));
  } catch (error) {
    console.error("Error updating selected accommodation:", error);
  }
};
