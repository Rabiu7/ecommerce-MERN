import "./WhyChooseUs.css";

import {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
  FiArrowUpRight,
} from "react-icons/fi";

function WhyChooseUs() {
  const features = [
    {
      number: "01",
      icon: <FiTruck />,
      title: "Free Delivery",
      description: "Free shipping on orders over ₹50.",
      label: "DELIVERY",
    },
    {
      number: "02",
      icon: <FiShield />,
      title: "Secure Payment",
      description: "100% secure and encrypted checkout.",
      label: "SECURITY",
    },
    {
      number: "03",
      icon: <FiRefreshCw />,
      title: "Easy Returns",
      description: "30-day hassle-free return policy.",
      label: "FLEXIBILITY",
    },
    {
      number: "04",
      icon: <FiHeadphones />,
      title: "24/7 Support",
      description: "We're always here to help you.",
      label: "SUPPORT",
    },
  ];

  return (
    <div className="why">
      <div className="why-grid">
        {features.map((item) => (
          <article className="why-card" key={item.number}>
            <div className="why-card-top">
              <span className="why-number">{item.number}</span>

              <span className="why-label">{item.label}</span>

              <span className="why-icon">{item.icon}</span>
            </div>

            <div className="why-card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>

            <div className="why-card-bottom" aria-hidden="true">
              <span className="why-card-line" />
              <FiArrowUpRight className="why-card-arrow" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default WhyChooseUs;
