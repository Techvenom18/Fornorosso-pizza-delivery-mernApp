import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const CONTENT = {
  privacy: { title: 'Privacy Policy', body: 'We respect your privacy. This is a student project (OIBSIP Level 3) - no real personal data is sold or shared with third parties. Data you provide is used only to operate this demo application.' },
  terms: { title: 'Terms of Service', body: 'By using FornoRosso, you agree this is a demonstration application built for educational purposes as part of the Oasis Infobyte internship program.' },
  refund: { title: 'Refund Policy', body: 'As a demo application, no real payments are processed in most cases. Any test transactions are not eligible for real refunds.' },
};

const Legal = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const content = CONTENT[type] || CONTENT.privacy;

  return (
    <div className="page-narrow">
      <Logo />
      <div className="auth-card">
        <h2>{content.title}</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{content.body}</p>
        <button className="btn" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
};

export default Legal;