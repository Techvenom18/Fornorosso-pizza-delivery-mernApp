import { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="faq-item">
    <button className="faq-question" onClick={onClick}>
      {question}
      <span className={`faq-icon ${isOpen ? 'open' : ''}`}>+</span>
    </button>
    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
      <p>{answer}</p>
    </div>
  </div>
);

const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <FAQItem
          key={item.question}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
};

export default FAQAccordion;