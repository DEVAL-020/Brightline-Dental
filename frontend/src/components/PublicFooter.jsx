import { Link } from 'react-router-dom'
import ToothMark from './ToothMark.jsx'

export default function PublicFooter() {
  return (
    <footer className="site-footer-full">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand"><ToothMark color="#fff" /> Brightline</div>
            <p style={{ color: '#9FC4BD', maxWidth: 280 }}>
              A calmer way to book, track, and manage every dental visit — for patients, dentists, and clinic staff alike.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="#services">Services</a></li>
              <li><a href="#doctors">Doctors</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/register">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4>Clinic hours</h4>
            <p style={{ color: '#9FC4BD', margin: 0 }}>Mon-Fri · 9:00 AM - 5:00 PM<br />Sat · 9:00 AM - 1:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Brightline Dental. All rights reserved.</span>
          <span>Built As a PBL Project for Web Application Development Subject.</span>
        </div>
      </div>
    </footer>
  )
}
