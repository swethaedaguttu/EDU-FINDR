import useSWR from 'swr';
import { useMemo, useState } from 'react';
import Image from 'next/image';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ShowSchools() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [toast, setToast] = useState({ visible: false, text: '' });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const limit = 3;
  
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(limit));
    if (query.trim()) p.set('q', query.trim());
    if (selectedCity) p.set('city', selectedCity);
    if (selectedBoard) p.set('board', selectedBoard);
    if (selectedType) p.set('type', selectedType);
    if (selectedHostel) p.set('hostel', selectedHostel);
    if (sortBy !== 'relevance') p.set('sort', sortBy);
    return p.toString();
  }, [page, query, selectedCity, selectedBoard, selectedType, selectedHostel, sortBy]);
  
  const { data, error, isLoading, mutate } = useSWR(`/api/schools?${qs}`, fetcher);

  const total = data?.total || 0;
  const schools = data?.data || [];

  // Derive non-dynamic, preset attributes per school (deterministic by id/email)
  function deriveMeta(school) {
    const seedStr = `${school?.id || ''}-${school?.email_id || school?.name || ''}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
    }
    const presets = {
      // Match UI filter options exactly
      types: ['All Boys', 'All Girls', 'Co-Education'],
      fees: [20731, 33731, 18500, 25000, 29999, 31500],
      // Store hostel in lowercase to match filter values ('yes'|'no')
      hostel: ['yes', 'no'],
      levels: ['Jr. Secondary', 'Sr. Secondary', 'Secondary'],
      boards: ['IB', 'CBSE', 'ICSE', 'IGCSE(Cambridge)', 'State Board']
    };
    const pick = (arr, offset = 0) => arr[(hash + offset) % arr.length];
    return {
      type: pick(presets.types, 1),
      fees: pick(presets.fees, 2),
      hostel: pick(presets.hostel, 3),
      level: pick(presets.levels, 4),
      board: pick(presets.boards, 5)
    };
  }

  const clearAllFilters = () => {
    setSelectedCity('');
    setSelectedBoard('');
    setSelectedType('');
    setSelectedHostel('');
    setSortBy('relevance');
    setPage(1);
  };

  function showComingSoon(message = 'Coming soon') {
    setToast({ visible: true, text: message });
    setTimeout(() => setToast({ visible: false, text: '' }), 2500);
  }

  const toggleReadMore = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Client-side filtering and sorting over derived attributes
  const decorated = schools.map((s) => ({ ...s, __meta: deriveMeta(s) }));

  const filtered = decorated.filter((s) => {
    if (selectedCity && s.city !== selectedCity) return false;
    if (selectedBoard && s.__meta.board !== selectedBoard) return false;
    if (selectedType && s.__meta.type !== selectedType) return false;
    if (selectedHostel && s.__meta.hostel !== selectedHostel) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${s.name} ${s.city} ${s.address}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'fees-low') return a.__meta.fees - b.__meta.fees || b.id - a.id;
    if (sortBy === 'fees-high') return b.__meta.fees - a.__meta.fees || b.id - a.id;
    return b.id - a.id; // relevance/newest first
  });

  const clientTotal = total || sorted.length;
  const totalPages = Math.max(1, Math.ceil(clientTotal / limit));
  const paged = sorted; // server already paginates by limit/page

  if (error) return (
    <div className="container">
      <div className="empty">
        <h3>Failed to load schools</h3>
        <p>Please try refreshing the page</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="container">
        {/* Hero Search Section */}
        <div className="heroSearchSection">
          <div className="heroSearchContent">
            <h1 className="heroSearchTitle">Search Schools · EduFindr</h1>
            <div className="heroSearchBar">
              <input 
                className="heroSearchInput" 
                placeholder="Start your school search"
                value={query} 
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setPage(1);
                    mutate();
                  }
                }} 
              />
              <button 
                className="heroSearchBtn"
                type="button"
                onClick={() => { setPage(1); mutate(); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="schoolsLayout">
          {/* Left Sidebar - Filters */}
          <div className="filtersSidebar">
            <div className="filtersHeader">
              <h3>Filters</h3>
              <button className="clearAllBtn" onClick={clearAllFilters}>Clear All</button>
            </div>

            {/* Sort By */}
            <div className="filterSection">
              <h4>Sort by</h4>
              <div className="radioGroup">
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="sort" 
                    value="relevance" 
                    checked={sortBy === 'relevance'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span className="radioText">Relevance</span>
                </label>
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="sort" 
                    value="fees-low" 
                    checked={sortBy === 'fees-low'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span className="radioText">Fees: Low to High</span>
                </label>
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="sort" 
                    value="fees-high" 
                    checked={sortBy === 'fees-high'}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                  <span className="radioText">Fees: High to Low</span>
                </label>
              </div>
            </div>

            {/* Cities Filter */}
            <div className="filterSection">
              <h4>Cities</h4>
              <div className="citySearch">
                <input 
                  className="citySearchInput" 
                  placeholder="Search city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
                {selectedCity && (
                  <button className="clearCityBtn" onClick={() => setSelectedCity('')}>×</button>
                )}
              </div>
              <div className="cityList">
                {['Lucknow', 'New Delhi', 'Gurgaon', 'Noida', 'Dehradun', 'Hyderabad', 'Chennai', 'Faridabad', 'Mumbai', 'Kolkata'].map(city => (
                  <label key={city} className="checkboxLabel">
                    <input 
                      type="checkbox" 
                      checked={selectedCity === city}
                      onChange={(e) => setSelectedCity(e.target.checked ? city : '')}
                    />
                    <span className="checkboxText">{city}</span>
                  </label>
                ))}
              </div>
              <button className="applyFilterBtn">Apply</button>
            </div>

            {/* Boards Filter */}
            <div className="filterSection">
              <h4>Boards</h4>
              <div className="boardList">
                {['ICSE', 'CBSE', 'IB', 'IGCSE(Cambridge)', 'State Board'].map(board => (
                  <label key={board} className="checkboxLabel">
                    <input 
                      type="checkbox" 
                      checked={selectedBoard === board}
                      onChange={(e) => setSelectedBoard(e.target.checked ? board : '')}
                    />
                    <span className="checkboxText">{board}</span>
                  </label>
                ))}
              </div>
              <button className="applyFilterBtn">Apply</button>
            </div>

            {/* School Type Filter */}
            <div className="filterSection">
              <h4>Type</h4>
              <div className="typeList">
                {['All Boys', 'All Girls', 'Co-Education'].map(type => (
                  <label key={type} className="checkboxLabel">
                    <input 
                      type="checkbox" 
                      checked={selectedType === type}
                      onChange={(e) => setSelectedType(e.target.checked ? type : '')}
                    />
                    <span className="checkboxText">{type}</span>
                  </label>
                ))}
              </div>
              <button className="applyFilterBtn">Apply</button>
            </div>

            {/* Hostel Filter */}
            <div className="filterSection">
              <h4>Hostel Facility</h4>
              <div className="radioGroup">
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="hostel" 
                    value="" 
                    checked={selectedHostel === ''}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                  />
                  <span className="radioText">Both/None</span>
                </label>
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="hostel" 
                    value="yes" 
                    checked={selectedHostel === 'yes'}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                  />
                  <span className="radioText">Yes</span>
                </label>
                <label className="radioLabel">
                  <input 
                    type="radio" 
                    name="hostel" 
                    value="no" 
                    checked={selectedHostel === 'no'}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                  />
                  <span className="radioText">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="mainContent">
            {isLoading && (
              <div className="loading">
                Loading schools...
              </div>
            )}

            {!isLoading && paged.length === 0 && (
              <div className="empty">
                <h3>No schools found</h3>
                <p>{query ? `No schools match "${query}"` : 'No schools have been added yet'}</p>
              </div>
            )}

            {!isLoading && paged.length > 0 && (
              <>
                <div className="schoolsList">
                  {paged.map((s) => (
                    <div key={s.id} className="schoolCard">
                      {s.image && (
                        <div className="schoolCardImage" style={{ position: 'relative', width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                          <Image src={s.image} alt={`${s.name} image`} fill priority sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                      )}
                      <div className="schoolCardHeader">
                        <div className="schoolInfo">
                          <h3 className="schoolName">{s.name}</h3>
                          <div className="schoolLocation">
                            <svg className="locationIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>{s.city}, {s.state}</span>
                          </div>
                        </div>
                        <div className="verificationBadge">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          verified by EduFindr
                        </div>
                      </div>

                      <div className="schoolCardActions">
                        <button 
                          className="actionBtn enquiryBtn"
                          type="button"
                          onClick={() => showComingSoon('✨ Admissions enquiry feature is coming soon!')}
                        >
                          Admission Enquiry
                        </button>
                        <button 
                          className="actionBtn shortlistBtn"
                          type="button"
                          onClick={() => showComingSoon('⭐ Shortlist your favorite schools — coming soon!')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          Shortlist
                        </button>
                        <button 
                          className="actionBtn alertsBtn"
                          type="button"
                          onClick={() => showComingSoon('🔔 Get alerts about admissions — coming soon!')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                          </svg>
                          Get Alerts
                        </button>
                      </div>

                      <div className="schoolCardDetails">
                        <div className="detailItem">
                          <svg className="detailIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1L12 13l-2.99-4A2.5 2.5 0 0 0 7 8H5.46c-.8 0-1.54.37-2.01 1L1 18.5V22h16z"/>
                          </svg>
                          <span>School Type: {s.__meta.type}</span>
                        </div>
                        <div className="detailItem">
                          <svg className="detailIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span>Fees: ₹ {s.__meta.fees.toLocaleString()}/month</span>
                        </div>
                        <div className="detailItem">
                          <svg className="detailIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h12v3h2V7z"/>
                          </svg>
                          <span>Hostel: {s.__meta.hostel === 'yes' ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detailItem">
                          <svg className="detailIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>Level: {s.__meta.level}</span>
                        </div>
                        <div className="detailItem">
                          <svg className="detailIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>Board: {s.__meta.board}</span>
                        </div>
                      </div>

                      <div className="schoolCardAbout">
                        <h4>About School</h4>
                        <p>
                          {expandedIds.has(s.id)
                            ? `${s.name} is a school located in ${s.city}, ${s.state}. The school provides quality education and has excellent facilities for students. Our dedicated teachers and staff ensure a nurturing environment for academic excellence and personal growth. We focus on holistic development with academics, sports, arts, and modern infrastructure to help students thrive.`
                            : `${s.name} is a school located in ${s.city}, ${s.state}. The school provides quality education and has excellent facilities...`}
                        </p>
                        <button type="button" className="readMoreBtn" onClick={() => toggleReadMore(s.id)}>
                          {expandedIds.has(s.id) ? 'Read Less' : 'Read More'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="btn" 
                      onClick={() => setPage((p) => Math.max(1, p - 1))} 
                      disabled={page <= 1}
                    >
                      Previous
                    </button>
                    <div className="paginationInfo">
                      Page {page} of {totalPages}
                      <br />
                      <span className="muted">Showing {paged.length} of {clientTotal} schools</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const n = i + 1;
                        const isActive = n === page;
                        return (
                          <button
                            key={n}
                            className="btn"
                            onClick={() => setPage(n)}
                            disabled={isActive}
                            aria-current={isActive ? 'page' : undefined}
                            style={isActive ? { background: 'var(--gray-400)' } : undefined}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      className="btn" 
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                      disabled={page >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {toast.visible && (
        <div 
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '28px',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '14px 18px',
            borderRadius: '14px',
            color: '#fff',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            fontWeight: 600,
            letterSpacing: '0.2px'
          }}
        >
          {toast.text}
        </div>
      )}

    </>
  );
}
