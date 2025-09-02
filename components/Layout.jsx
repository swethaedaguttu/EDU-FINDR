import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'EduFindr' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Discover and manage schools in your area" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <nav className="nav">
        <div className="navInner">
          <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/images/edufindr-logo.svg" alt="EduFindr logo" width="28" height="28" />
            <span className="brandTwoTone">
              <span className="brandPartA">EDU</span>
              <span className="brandPartB">FINDR</span>
            </span>
          </Link>
          <div className="navLinks">
            <Link href="/">
              Home
            </Link>
            <Link href="/addSchool">
              Add School
            </Link>
            <Link href="/showSchools">
              Show Schools
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>

      <footer className="footer">
        <div className="footerContent">
          <p>&copy; 2025 EDUFINDER. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
