import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="hero">
        <h1 className="handwrittenTitle">FIND THE BEST SCHOOL FOR YOUR CHILD</h1>
        <p className="handwrittenSubtitle">
          A comprehensive platform to discover and manage schools in your area
        </p>
      </div>
      
      <div className="container">
        <div className="featureGrid">
          <div className="featureCard enhancedBg">
            <h2>Add Your School</h2>
            <p className="muted">
              Register your school with complete details including contact information, 
              photos, and admission procedures. Help parents find the perfect educational 
              environment for their children.
            </p>
            <Link href="/addSchool" className="btn">
              Add School
            </Link>
          </div>
          
          <div className="featureCard enhancedBg">
            <h2>Browse Schools</h2>
            <p className="muted">
              Search and explore schools with advanced filtering, detailed information, 
              and beautiful photo galleries. Find schools based on location, board, 
              and your specific preferences.
            </p>
            <Link href="/showSchools" className="btn">
              View Schools
            </Link>
          </div>
        </div>
        
        <div className="enhancedBg" style={{ 
          marginTop: '60px', 
          padding: '40px', 
          textAlign: 'center',
          backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/images/home.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <h3 style={{ color: '#ffffff', textShadow: '0 2px 6px rgba(0,0,0,0.4)', marginBottom: '24px' }}>How This Platform Helps Parents and Schools</h3>
          <div style={{ 
            display: 'grid', 
            gap: '24px', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            marginTop: '24px' 
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👨‍👩‍👧</div>
              <strong style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>For Parents</strong>
              <p className="muted" style={{ margin: '8px 0 0 0', color: '#eef2f7' }}>
                Discover nearby schools, compare details and photos, shortlist favorites,
                and send admission enquiries — all in one place.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏫</div>
              <strong style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>For Schools</strong>
              <p className="muted" style={{ margin: '8px 0 0 0', color: '#eef2f7' }}>
                Add your school in minutes with photos and contact info to reach
                more parents looking for the right place for their children.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔎</div>
              <strong style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>Find the Right Fit</strong>
              <p className="muted" style={{ margin: '8px 0 0 0', color: '#eef2f7' }}>
                Search by name, city or address, apply filters, and browse clear images
                to choose confidently for your child.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚙️</div>
              <strong style={{ color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>Simple & Fast</strong>
              <p className="muted" style={{ margin: '8px 0 0 0', color: '#eef2f7' }}>
                Optimized uploads and quick loading ensure a smooth experience on any device.
              </p>
            </div>
          </div>
        </div>

        <div className="enhancedBg" style={{ 
          marginTop: '40px', 
          padding: '40px', 
          textAlign: 'center',
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/home.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '16px', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>Ready to Get Started?</h3>
          <p className="muted" style={{ marginBottom: '24px', color: '#eef2f7' }}>
            Join thousands of schools and parents who trust our platform for educational discovery
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/addSchool" className="btn">
              Add Your School
            </Link>
            <Link href="/showSchools" className="btn" style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' 
            }}>
              Explore Schools
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
