import "./WhyChooseUs.css";

import {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeadphones,
} from "react-icons/fi";

function WhyChooseUs() {
  const features = [
    {
      icon: <FiTruck />,
      title: "Free Delivery",
      description: "Free shipping on orders over $50.",
    },
    {
      icon: <FiShield />,
      title: "Secure Payment",
      description: "100% secure and encrypted checkout.",
    },
    {
      icon: <FiRefreshCw />,
      title: "Easy Returns",
      description: "30-day hassle-free return policy.",
    },
    {
      icon: <FiHeadphones />,
      title: "24/7 Support",
      description: "We're always here to help you.",
    },
  ];

  return (
    <section className="why">
      <div className="container">

        <div className="section-title">
          <h2>Why Choose Us</h2>
          <p>Making your shopping experience better every day.</p>
        </div>

        <div className="why-grid">
          {features.map((item, index) => (
            <div className="why-card" key={index}>
              <div className="why-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;