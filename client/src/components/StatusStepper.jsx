const STEPS = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

const StatusStepper = ({ status }) => {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div>
      <div className="stepper">
        {STEPS.map((step, i) => (
          <div key={step} className={`stepper-step ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`}>
            <div className="stepper-dot">{i <= currentIndex ? '●' : ''}</div>
            {i < STEPS.length - 1 && <div className={`stepper-line ${i < currentIndex ? 'done' : ''}`}></div>}
          </div>
        ))}
      </div>
      <div className="stepper-labels">
        {STEPS.map((step, i) => (
          <span key={step} className={i === currentIndex ? 'active' : ''}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StatusStepper;