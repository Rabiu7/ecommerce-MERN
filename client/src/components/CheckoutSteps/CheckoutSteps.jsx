import "./CheckoutSteps.css";

import { FiCheck, FiCreditCard, FiMapPin, FiCheckCircle } from "react-icons/fi";

function CheckoutSteps({ currentStep }) {
  const steps = [
    {
      number: 1,
      title: "Delivery",
      subtitle: "Address",
      icon: <FiMapPin />,
    },
    {
      number: 2,
      title: "Payment",
      subtitle: "Secure payment",
      icon: <FiCreditCard />,
    },
    {
      number: 3,
      title: "Confirmation",
      subtitle: "Order placed",
      icon: <FiCheckCircle />,
    },
  ];

  return (
    <div className="checkout-steps">
      {steps.map((step, index) => {
        const completed = currentStep > step.number;
        const active = currentStep === step.number;

        return (
          <div className="checkout-step-wrapper" key={step.number}>
            <div
              className={`checkout-step ${
                completed ? "completed" : ""
              } ${active ? "active" : ""}`}
            >
              <div className="step-icon">
                {completed ? <FiCheck /> : step.icon}
              </div>

              <div className="step-content">
                <span>{step.number}</span>

                <strong>{step.title}</strong>

                <small>{step.subtitle}</small>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  currentStep > step.number ? "completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CheckoutSteps;
