import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://lost-and-found-management-system-9ser.onrender.com";

function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    itemName: "",
    description: "",
    type: "Lost",
    location: "",
    date: "",
    contactInfo: ""
  });

  const token = localStorage.getItem("token");

  // 🔹 Fetch Items
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items`);
      setItems(res.data);
    } catch (err) {
      alert("Error fetching items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 🔹 Add Item
  const addItem = async (e) => {
    e.preventDefault();

    if (!form.itemName) {
      alert("Item Name is required");
      return;
    }

    try {
      await axios.post(`${API}/api/items`, form, {
        headers: { Authorization: token }
      });

      fetchItems();

      // ✅ Reset form
      setForm({
        itemName: "",
        description: "",
        type: "Lost",
        location: "",
        date: "",
        contactInfo: ""
      });

    } catch (err) {
      alert("Error adding item");
    }
  };

  // 🔹 Delete
  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/api/items/${id}`, {
        headers: { Authorization: token }
      });
      fetchItems();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // 🔹 Search
  const searchItems = async () => {
    try {
      const res = await axios.get(`${API}/api/items/search?name=${search}`);
      setItems(res.data);
    } catch {
      alert("Search failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="main-container">

      {/* HEADER */}
      <div className="navbar">
        <h2>Lost & Found</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <input
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchItems}>Search</button>
      </div>

      {/* FORM */}
      <div className="form-card">
        <h3>Add Item</h3>
        <form onSubmit={addItem}>
          <input
            placeholder="Item Name"
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            placeholder="Contact Info"
            value={form.contactInfo}
            onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Lost</option>
            <option>Found</option>
          </select>

          <button className="add-btn">Add Item</button>
        </form>
      </div>

      {/* ITEMS */}
      <div className="grid">
        {items.map((item) => (
          <div key={item._id} className="card">
            <h3>{item.itemName}</h3>
            <p>{item.description}</p>
            <p><b>📍 {item.location}</b></p>
            <p className={item.type === "Lost" ? "lost" : "found"}>
              {item.type}
            </p>
            <button onClick={() => deleteItem(item._id)}>Delete</button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;