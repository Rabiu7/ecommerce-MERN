import "./AdminCustomers.css";

import { useEffect, useState } from "react";

import {
  FiUsers,
  FiSearch,
  FiEye,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiRefreshCw,
} from "react-icons/fi";

const VITE_API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.2.122:5000";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /* =========================================================
     FETCH CUSTOMERS
  ========================================================= */

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${VITE_API_URL}/api/admin/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      console.log("Admin customers:", data);

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Customers error:", error);

      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD CUSTOMERS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${VITE_API_URL}/api/admin/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await response.json();

        console.log("Admin customers:", data);

        if (!cancelled) {
          setCustomers(data.customers || []);
          setError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Customers error:", error);

          setError("Failed to load customers");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      customer.name?.toLowerCase().includes(searchValue) ||
      customer.email?.toLowerCase().includes(searchValue) ||
      customer.phone?.toLowerCase().includes(searchValue)
    );
  });

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     GET INITIALS
  ========================================================= */

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase() || "CU"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="admin-customers">
        <div className="customers-loading">
          <div className="customers-spinner"></div>

          <span>Loading customers...</span>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="admin-customers">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="customers-header">
        <span>CUSTOMER MANAGEMENT</span>

        <div className="customers-title-row">
          <div>
            <h1>Customers</h1>

            <p>Manage your HomeNeeds customers and view their order history.</p>
          </div>

          <div className="customers-header-icon">
            <FiUsers />
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="customers-error">
          <span>{error}</span>

          <button type="button" onClick={fetchCustomers}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          CUSTOMER SUMMARY
      ===================================================== */}

      <div className="customers-summary">
        <div className="customer-summary-card">
          <div>
            <span>Total Customers</span>

            <strong>{customers.length.toLocaleString("en-IN")}</strong>
          </div>

          <div className="summary-icon">
            <FiUsers />
          </div>
        </div>

        <div className="customer-summary-card">
          <div>
            <span>Customers With Orders</span>

            <strong>
              {
                customers.filter(
                  (customer) => Number(customer.total_orders) > 0
                ).length
              }
            </strong>
          </div>

          <div className="summary-icon orders">
            <FiShoppingBag />
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER TABLE CARD
      ===================================================== */}

      <div className="customers-card">
        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="customers-card-header">
          <div>
            <h2>All Customers</h2>

            <p>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* SEARCH */}

          <div className="customer-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="search-clear"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>

                <th>Contact</th>

                <th>Orders</th>

                <th>Total Spent</th>

                <th>Joined</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="customers-empty">
                      <FiUsers />

                      <strong>No customers found</strong>

                      <p>
                        {search
                          ? "Try a different search."
                          : "No customers have registered yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const initials = getInitials(customer.name);

                  return (
                    <tr key={customer.id}>
                      {/* CUSTOMER */}

                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">{initials}</div>

                          <div className="customer-name">
                            <strong>{customer.name}</strong>

                            <span>Customer #{customer.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}

                      <td>
                        <div className="customer-contact">
                          <span>
                            <FiMail />

                            {customer.email || "-"}
                          </span>

                          {customer.phone && (
                            <span>
                              <FiPhone />

                              {customer.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ORDERS */}

                      <td>
                        <span className="order-count">
                          {Number(customer.total_orders || 0)}
                        </span>
                      </td>

                      {/* TOTAL SPENT */}

                      <td>
                        <strong className="customer-spent">
                          ₹
                          {Number(customer.total_spent || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </strong>
                      </td>

                      {/* JOINED */}

                      <td>
                        <span className="customer-date">
                          {formatDate(customer.created_at)}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="view-customer-button"
                          title="View customer"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <FiEye />

                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER DETAILS MODAL
      ===================================================== */}

      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="customer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="customer-modal-header">
              <div>
                <span>CUSTOMER DETAILS</span>

                <h2>{selectedCustomer.name || "Customer"}</h2>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                title="Close"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>

            {/* CUSTOMER PROFILE */}

            <div className="customer-modal-profile">
              <div className="customer-modal-avatar">
                {getInitials(selectedCustomer.name)}
              </div>

              <div>
                <strong>{selectedCustomer.name || "-"}</strong>

                <span>Customer #{selectedCustomer.id}</span>
              </div>
            </div>

            {/* CUSTOMER DETAILS */}

            <div className="customer-details-grid">
              <div className="customer-detail-item">
                <span>Email</span>

                <strong>{selectedCustomer.email || "-"}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Phone</span>

                <strong>{selectedCustomer.phone || "-"}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Total Orders</span>

                <strong>{Number(selectedCustomer.total_orders || 0)}</strong>
              </div>

              <div className="customer-detail-item">
                <span>Total Spent</span>

                <strong>
                  ₹
                  {Number(selectedCustomer.total_spent || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>
              </div>

              <div className="customer-detail-item">
                <span>Joined</span>

                <strong>{formatDate(selectedCustomer.created_at)}</strong>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="customer-modal-footer">
              <button type="button" onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
