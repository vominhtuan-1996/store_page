import { useState } from 'react';
import { useNavigate } from '../router';
import '../styles/tubong.css';

export const TuBongHero = () => {
  const navigate = useNavigate();
  return (
    <section
      className="tubong-hero"
      style={{
        backgroundImage: 'url(/images/hero-landscape.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="tubong-hero-overlay"></div>
      <div className="tubong-hero-content">
        <h1 className="tubong-hero-title">Tu Bông</h1>
        <p className="tubong-hero-subtitle">Nơi yên bình giữa núi rừng</p>
        <button className="tubong-cta" onClick={() => navigate({ page: 'hub' })}>Khám Phá</button>
      </div>
    </section>
  );
};

export const TuBongGallery = () => {
  const items = [
    { title: 'Mùa Nắng', desc: 'Ánh nắng vàng rải khắp cánh đồng xanh mát', gradient: 'linear-gradient(135deg, #8B6F47 0%, #A0826D 100%)' },
    { title: 'Mùa Lúa', desc: 'Ruộng lúa vàng óng đem lại mùa gặt bội thu', gradient: 'linear-gradient(135deg, #6B8E23 0%, #9ACD32 100%)' },
    { title: 'Mùa Mưa', desc: 'Những cơn mưa rèm mang tính tình cho núi rừng', gradient: 'linear-gradient(135deg, #696969 0%, #A9A9A9 100%)' },
    { title: 'Mùa Thu', desc: 'Sắc vàng nâu của mùa thu tô đẹp quê hương', gradient: 'linear-gradient(135deg, #CD853F 0%, #DEB887 100%)' },
    { title: 'Mùa Đông', desc: 'Sương sớm bao phủ khiến mọi thứ thêm huyền bí', gradient: 'linear-gradient(135deg, #2F4F4F 0%, #708090 100%)' },
    { title: 'Đời Sống Quê', desc: 'Nét sinh hoạt chân thật, ấm áp của con người Tu Bông', gradient: 'linear-gradient(135deg, #556B2F 0%, #7CB342 100%)' },
  ];

  return (
    <section className="tubong-gallery">
      <div className="tubong-container">
        <div className="tubong-section-header">
          <h2>Những Khoảnh Khắc Đẹp</h2>
          <p className="tubong-section-subtitle">Vẻ đẹp tự nhiên của Tu Bông qua từng mùa</p>
        </div>
        <div className="tubong-gallery-grid">
          {items.map((item, i) => (
            <div key={i} className="tubong-gallery-item">
              <div className="tubong-gallery-image" style={{ background: item.gradient }}></div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TuBongStory = () => {
  const highlights = [
    { icon: '🏡', title: 'Gia Đình', desc: 'Nơi những giá trị gia đình được gìn giữ' },
    { icon: '🌾', title: 'Nông Nghiệp', desc: 'Đất nước màu mỡ, cây lúa vàng rì' },
    { icon: '🏞️', title: 'Thiên Nhiên', desc: 'Rừng xanh, nước sạch, không khí trong lành' },
    { icon: '🤝', title: 'Cộng Đồng', desc: 'Mối liên kết yêu thương của con người' },
  ];

  return (
    <section className="tubong-story">
      <div className="tubong-container">
        <div className="tubong-story-content">
          <div className="tubong-story-text">
            <h2>Câu Chuyện Tu Bông</h2>
            <p>Tu Bông không chỉ là tên một vùng đất, mà còn là biểu tượng của tình yêu, sự hy sinh và những giá trị truyền thống. Nơi đây, mỗi cơn gió mang theo câu chuyện, mỗi hạt sương bão chứa dung tình.</p>
            <p>Trong lịch sử, Tu Bông đã chứng kiến bao thế hệ con người cần cù xây dựng, từ những người nông dân chăm chỉ cho đến thế hệ trẻ hiện nay. Các giá trị cộng đồng, tình cảm gia đình, và lòng yêu quê hương vẫn sống mãi trong tim mỗi người Tu Bông.</p>
            <p>Chúng tôi tin rằng, dù cuộc sống có thay đổi bao nhiêu, những gì Tu Bông mang lại - sự bình yên, tình người, và hình ảnh đẹp của thiên nhiên - sẽ mãi mãi là kho tàng quý giá.</p>
          </div>
          <div className="tubong-highlights">
            {highlights.map((h, i) => (
              <div key={i} className="tubong-highlight">
                <div className="tubong-highlight-icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const TuBongContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setSubmitted(false);
      }, 2000);
    }
  };

  return (
    <section className="tubong-contact">
      <div className="tubong-container">
        <div className="tubong-section-header">
          <h2>Liên Hệ Chúng Tôi</h2>
          <p className="tubong-section-subtitle">Cùng chia sẻ những câu chuyện về Tu Bông</p>
        </div>
        <div className="tubong-contact-content">
          <form className="tubong-contact-form" onSubmit={handleSubmit}>
            <div className="tubong-form-group">
              <input
                type="text"
                placeholder="Tên của bạn"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="tubong-form-group">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="tubong-form-group">
              <textarea
                placeholder="Tin nhắn của bạn"
                rows={5}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>
            <button type="submit" className="tubong-submit">
              {submitted ? '✓ Đã Gửi' : 'Gửi Tin Nhắn'}
            </button>
          </form>

          <div className="tubong-contact-info">
            <div className="tubong-info-item">
              <h3>Địa Chỉ</h3>
              <p>Tu Bông, Quảng Trị, Việt Nam</p>
            </div>
            <div className="tubong-info-item">
              <h3>Điện Thoại</h3>
              <p>+84 (0) 123 456 789</p>
            </div>
            <div className="tubong-info-item">
              <h3>Email</h3>
              <p>hello@tubong.vn</p>
            </div>
            <div className="tubong-info-item">
              <h3>Giờ Làm Việc</h3>
              <p>Thứ 2 - Chủ nhật: 08:00 - 17:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const TuBongFooter = () => {
  return (
    <footer className="tubong-footer">
      <div className="tubong-container">
        <div className="tubong-footer-content">
          <div className="tubong-footer-section">
            <h3>Tu Bông</h3>
            <p>Nơi lưu giữ tình thương và những kỷ niệm đẹp</p>
          </div>
          <div className="tubong-footer-section">
            <h3>Liên Kết Nhanh</h3>
            <ul>
              <li><a href="#hero">Trang Chủ</a></li>
              <li><a href="#gallery">Hình Ảnh</a></li>
              <li><a href="#story">Câu Chuyện</a></li>
              <li><a href="#contact">Liên Hệ</a></li>
            </ul>
          </div>
          <div className="tubong-footer-section">
            <h3>Theo Dõi Chúng Tôi</h3>
            <div className="tubong-social-links">
              <a href="#" className="tubong-social-link">Facebook</a>
              <a href="#" className="tubong-social-link">Instagram</a>
              <a href="#" className="tubong-social-link">YouTube</a>
            </div>
          </div>
        </div>
        <div className="tubong-footer-bottom">
          <p>&copy; 2024 Tu Bông. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export const TuBongLandingPage = () => {
  return (
    <div style={{ background: '#F5F1E8' }}>
      <TuBongHero />
      <TuBongGallery />
      <TuBongStory />
      <TuBongContact />
      <TuBongFooter />
    </div>
  );
};
