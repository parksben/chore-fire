import { type FC, useEffect, useRef, useState } from 'react'
import './style.scss'

const Demo: FC = () => {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      const sections = document.querySelectorAll('.section')
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
          setActiveSection(index)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Canvas starry background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: Array<{
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      opacity: number
    }> = []

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random(),
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.x += star.vx
        star.y += star.vy

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Connect nearby stars
        stars.forEach((otherStar) => {
          const dx = star.x - otherStar.x
          const dy = star.y - otherStar.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(star.x, star.y)
            ctx.lineTo(otherStar.x, otherStar.y)
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  const aiFeatures = [
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      icon: '🧠',
      description:
        'Neural networks simulate brain structure to achieve complex pattern recognition through multi-layer processing',
      color: '#ff6b6b',
    },
    {
      id: 'computer-vision',
      title: 'Computer Vision',
      icon: '👁️',
      description:
        'Enabling machines to understand and interpret the visual world, from image recognition to autonomous driving',
      color: '#4ecdc4',
    },
    {
      id: 'nlp',
      title: 'Natural Language Processing',
      icon: '💬',
      description: 'Enabling computers to understand, interpret, and generate human language',
      color: '#45b7d1',
    },
    {
      id: 'reinforcement-learning',
      title: 'Reinforcement Learning',
      icon: '🎮',
      description:
        'Learning optimal strategies through environmental interaction, applied to game AI and robot control',
      color: '#f9ca24',
    },
    {
      id: 'generative-ai',
      title: 'Generative AI',
      icon: '🎨',
      description:
        'Creating original content including text, images, music, and code through advanced AI models',
      color: '#a29bfe',
    },
    {
      id: 'edge-computing',
      title: 'Edge AI',
      icon: '⚡',
      description:
        'Running AI algorithms on edge devices for real-time processing with minimal latency',
      color: '#fd79a8',
    },
  ]

  const spaceExplorations = [
    {
      id: 'mars',
      title: 'Mars Exploration',
      subtitle: 'Red Planet Mission',
      description: "Humanity's grand plan to explore the red planet and search for traces of life",
      year: '2030+',
      image: '🚀',
    },
    {
      id: 'lunar',
      title: 'Lunar Base',
      subtitle: 'Moon Colony',
      description:
        'Establishing a permanent lunar base as a springboard for deep space exploration',
      year: '2025',
      image: '🌙',
    },
    {
      id: 'station',
      title: 'Space Station',
      subtitle: 'Orbital Laboratory',
      description:
        'Successor to the International Space Station, advancing space research and commercialization',
      year: '2028',
      image: '🛸',
    },
  ]

  return (
    <div className="demo-container">
      <canvas ref={canvasRef} className="stars-canvas" />

      {/* Hero Section */}
      <section className="section hero-section">
        <div
          className="hero-content"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <h1 className="hero-title">
            <span className="gradient-text">AI × Space Exploration</span>
          </h1>
          <p className="hero-subtitle">A New Era of AI-Driven Cosmic Discovery</p>
          <div className="hero-description">
            <p>When Artificial Intelligence Meets the Vast Universe</p>
            <p>Where Technology and Dreams Converge</p>
          </div>
          <div className="scroll-indicator">
            <span>Scroll Down to Explore More</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>

        <div className="floating-elements">
          <div className="float-item float-1">🌟</div>
          <div className="float-item float-2">✨</div>
          <div className="float-item float-3">💫</div>
          <div className="float-item float-4">⭐</div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="section ai-section">
        <div className="section-header">
          <h2 className="section-title">Core AI Technologies</h2>
          <p className="section-subtitle">Cutting-edge Technologies Advancing Human Civilization</p>
        </div>

        <div className="features-grid">
          {aiFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-card ${activeSection === 1 ? 'active' : ''}`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-glow" style={{ backgroundColor: feature.color }} />
            </div>
          ))}
        </div>

        <div className="ai-visualization">
          <div className="neural-network">
            {[
              { id: 'input', nodes: 3 },
              { id: 'hidden', nodes: 5 },
              { id: 'output', nodes: 3 },
            ].map((layer) => (
              <div key={layer.id} className="network-layer">
                {Array.from({ length: layer.nodes }, (_, i) => (
                  <div key={`${layer.id}-node-${i}`} className="network-node">
                    <div className="node-pulse" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Space Exploration Section */}
      <section className="section space-section">
        <div className="section-header">
          <h2 className="section-title">Space Exploration Programs</h2>
          <p className="section-subtitle">Humanity's Grand Journey to Interstellar Civilization</p>
        </div>

        <div className="space-timeline">
          {spaceExplorations.map((exploration, index) => (
            <div
              key={exploration.id}
              className={`timeline-item ${activeSection === 2 ? 'active' : ''}`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="timeline-marker">
                <span className="timeline-year">{exploration.year}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-icon">{exploration.image}</div>
                <h3 className="timeline-title">{exploration.title}</h3>
                <p className="timeline-subtitle">{exploration.subtitle}</p>
                <p className="timeline-description">{exploration.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-stats">
          <div className="stat-item">
            <div className="stat-number">384,400</div>
            <div className="stat-label">Kilometers</div>
            <div className="stat-description">Earth-Moon Distance</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">225M</div>
            <div className="stat-label">Kilometers</div>
            <div className="stat-description">Earth-Mars Distance</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">12</div>
            <div className="stat-label">People</div>
            <div className="stat-description">Moonwalkers</div>
          </div>
        </div>
      </section>

      {/* Technology Fusion Section */}
      <section className="section fusion-section">
        <div className="section-header">
          <h2 className="section-title">AI-Powered Space Exploration</h2>
          <p className="section-subtitle">
            How Intelligent Technology Transforms Space Exploration
          </p>
        </div>

        <div className="fusion-content">
          <div className="fusion-card">
            <div className="fusion-icon">🤖</div>
            <h3>Autonomous Navigation</h3>
            <p>
              AI algorithms enable spacecraft to navigate and make decisions autonomously in unknown
              environments
            </p>
          </div>

          <div className="fusion-card">
            <div className="fusion-icon">📡</div>
            <h3>Data Analysis</h3>
            <p>
              Machine learning processes vast astronomical data to discover new celestial bodies and
              phenomena
            </p>
          </div>

          <div className="fusion-card">
            <div className="fusion-icon">🛰️</div>
            <h3>Intelligent Communication</h3>
            <p>
              Optimizing deep space communication protocols to improve data transmission efficiency
              and reliability
            </p>
          </div>

          <div className="fusion-card">
            <div className="fusion-icon">🔬</div>
            <h3>Scientific Research</h3>
            <p>
              AI-assisted analysis of experimental data accelerates the pace of scientific discovery
            </p>
          </div>
        </div>

        <div className="orbit-animation">
          <div className="orbit orbit-1">
            <div className="planet planet-1"></div>
          </div>
          <div className="orbit orbit-2">
            <div className="planet planet-2"></div>
          </div>
          <div className="orbit orbit-3">
            <div className="planet planet-3"></div>
          </div>
          <div className="center-star"></div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section className="section future-section">
        <div className="future-content">
          <h2 className="future-title">Future Vision</h2>
          <div className="future-grid">
            <div className="future-item">
              <div className="future-number">2030</div>
              <p>First Crewed Mars Mission</p>
            </div>
            <div className="future-item">
              <div className="future-number">2040</div>
              <p>Permanent Lunar Base Established</p>
            </div>
            <div className="future-item">
              <div className="future-number">2050</div>
              <p>Mars Colony Takes Shape</p>
            </div>
            <div className="future-item">
              <div className="future-number">2100</div>
              <p>Free Navigation Within Solar System</p>
            </div>
          </div>

          <div className="future-quote">
            <p>"The destiny of humanity is not on Earth, but among the stars."</p>
            <p className="quote-author">— In Honor of All Space Explorers</p>
            
            <div className="additional-quotes">
              <div className="quote-item">
                <p>"We choose to go to the Moon and do the other things, not because they are easy, but because they are hard."</p>
                <p className="quote-author">— John F. Kennedy, 1962</p>
              </div>
              
              <div className="quote-item">
                <p>"The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever."</p>
                <p className="quote-author">— Konstantin Tsiolkovsky</p>
              </div>
              
              <div className="quote-item">
                <p>"Exploration is in our nature. We began as wanderers, and we are wanderers still."</p>
                <p className="quote-author">— Carl Sagan</p>
              </div>
            </div>

            <div className="mission-statement">
              <h3>Our Mission</h3>
              <p>Through the power of artificial intelligence and human ingenuity, we are pioneering new frontiers in space exploration. Our commitment is to expand humanity's presence beyond Earth, ensuring a sustainable and thriving future among the stars.</p>
              <div className="mission-values">
                <div className="value-item">
                  <span className="value-icon">🌍</span>
                  <span>Sustainability</span>
                </div>
                <div className="value-item">
                  <span className="value-icon">🤝</span>
                  <span>Collaboration</span>
                </div>
                <div className="value-item">
                  <span className="value-icon">🚀</span>
                  <span>Innovation</span>
                </div>
                <div className="value-item">
                  <span className="value-icon">🌟</span>
                  <span>Inspiration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="demo-footer">
        <div className="footer-content">
          <p>🚀 Exploration Never Ends | ✨ Dreams Light the Way | 🌌 We Create the Future</p>
        </div>
      </footer>
    </div>
  )
}

export default Demo
