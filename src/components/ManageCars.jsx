import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { getCarImageUrl } from "../utils/carImage";
import "./ManageCars.css";

export default function ManageCars({ role = "admin" }) {
  const [cars, setCars] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const imageInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    seats: "",
    transmission: "",
    fuel: "",
    price: "",
    description: "",
  });
  const [editingCar, setEditingCar] = useState(null);
  const authConfig = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  }), []);

  // The backend returns all cars to super admins and only owned cars to car owners.
  const loadCars = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cars/manage`, authConfig);
      setCars(res.data);
    } catch (err) {
      console.error("Error loading cars:", err);
    }
  }, [authConfig]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCars();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCars]);

  // Add car
  const addCar = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cars/add`, buildFormData(), authConfig);
      loadCars();
      clearForm();
    } catch (err) {
      console.error("Error adding car:", err);
      window.alert(err.response?.data?.message || "Error adding car. Please try again.");
    }
  };

  // Update car
  const updateCar = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/cars/update/${editingCar._id}`,
        buildFormData(),
        authConfig
      );
      loadCars();
      clearForm();
      setEditingCar(null);
    } catch (err) {
      console.error("Error updating car:", err);
      window.alert(err.response?.data?.message || "Error updating car. Please try again.");
    }
  };

  // Delete
  const deleteCar = async (id) => {
    if (!window.confirm("Delete this car permanently?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/cars/delete/${id}`, authConfig);
      loadCars();
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };

  // Edit
  const editCar = (car) => {
    setEditingCar(car);
    setForm({
      name: car.name || "",
      seats: car.seats || "",
      transmission: car.transmission || "",
      fuel: car.fuel || "",
      price: car.price || "",
      description: car.description || "",
    });
    setSelectedImages([]);
  };

  const buildFormData = () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    selectedImages.forEach((image) => formData.append("images", image));
    return formData;
  };

  // Clear Form
  const clearForm = () => {
    setForm({
      name: "",
      seats: "",
      transmission: "",
      fuel: "",
      price: "",
      description: "",
    });
    setSelectedImages([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setEditingCar(null);
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    editingCar ? updateCar() : addCar();
  };

  return (
    <div className="admin-card enhanced-ui">
      <h2 className="title">{role === "superadmin" ? "Manage All Cars" : "Manage My Cars"}</h2>

      {/* FORM */}
      <form className="car-form grid-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Car Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label className="image-upload-field">
          Car Photos
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
          />
          <span>
            Upload up to 10 exterior and interior photos. Users can browse these in the car gallery.
          </span>
          {selectedImages.length > 0 && (
            <span>{selectedImages.length} photo{selectedImages.length === 1 ? "" : "s"} selected</span>
          )}
          {editingCar && (
            <span>New photos will be added to the existing gallery.</span>
          )}
        </label>

        <input
          type="number"
          placeholder="Seats"
          value={form.seats}
          onChange={(e) => setForm({ ...form, seats: e.target.value })}
          min="1"
          required
        />

        <input
          type="text"
          placeholder="Transmission"
          value={form.transmission}
          onChange={(e) => setForm({ ...form, transmission: e.target.value })}
        />

        <input
          type="text"
          placeholder="Fuel"
          value={form.fuel}
          onChange={(e) => setForm({ ...form, fuel: e.target.value })}
        />

        <input
          type="text"
          placeholder="Price (₱ / day)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="full-width"
        ></textarea>

        {/* BUTTONS */}
        {editingCar ? (
          <>
            <button type="submit" className="btn btn-update full-width">
              Update Car
            </button>

            <button
              type="button"
              className="btn btn-cancel full-width"
              onClick={clearForm}
            >
              Cancel Edit
            </button>
          </>
        ) : (
          <button type="submit" className="btn btn-add full-width">
            Add Car
          </button>
        )}
      </form>

      {/* CAR TABLE */}
      <table className="car-table elegant-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Seats</th>
            <th>Fuel</th>
            <th>Transmission</th>
            <th>Price</th>
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {cars.map((car) => (
            <tr key={car._id}>
              <td>
                {(car.images?.[0] || car.image) ? (
                  <img src={getCarImageUrl(car.images?.[0] || car.image)} className="thumbnail" alt={car.name} />
                ) : (
                  <span>No Image</span>
                )}
              </td>
              <td>{car.name}</td>
              <td>{car.seats}</td>
              <td>{car.fuel}</td>
              <td>{car.transmission}</td>
              <td>{car.price}</td>

              <td className="action-buttons">
                <button className="btn btn-edit" onClick={() => editCar(car)}>
                  Edit
                </button>

                <button
                  className="btn btn-delete"
                  onClick={() => deleteCar(car._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
