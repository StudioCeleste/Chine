"use client";

import { useState } from 'react';
import styles from './page.module.css';

// Mock data (en attendant Supabase)
const MOCK_EVENTS = [
  {
    id: '1',
    day: 1,
    date: '1 Sept',
    time: '12:30',
    title: 'Arrivée à PEK',
    location: 'Aéroport International de Pékin',
    completed: true,
  },
  {
    id: '2',
    day: 1,
    date: '1 Sept',
    time: '15:00',
    title: 'Cité Interdite',
    location: 'La Cité interdite',
    completed: true,
  },
  {
    id: '3',
    day: 1,
    date: '1 Sept',
    time: '19:00',
    title: 'Canard Laqué',
    location: 'Restaurant Quanjude',
    completed: false,
  },
  {
    id: '4',
    day: 2,
    date: '2 Sept',
    time: '09:00',
    title: 'Grande Muraille de Mutianyu',
    location: 'Mutianyu',
    completed: false,
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('timeline');
  
  // Grouper les évènements par jour
  const days = MOCK_EVENTS.reduce((acc, event) => {
    const dayName = `Jour ${event.day}`;
    if (!acc[dayName]) {
      acc[dayName] = { date: event.date, events: [] };
    }
    acc[dayName].events.push(event);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <header className={styles.header + ' animate-fade-in'}>
        <h1 className={styles.title}>Chine</h1>
        <p className={styles.subtitle}>Chronologie Collaborative</p>
      </header>

      <main className={styles.timeline}>
        {Object.entries(days).map(([dayName, data], index) => (
          <section key={dayName} className={styles.daySection + ' animate-fade-in'} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={styles.dayHeader}>
              <div className={styles.dayIndicator}></div>
              <h2 className={styles.dayTitle}>{dayName}</h2>
              <span className={styles.dayDate}>{data.date}</span>
            </div>

            {data.events.map((event) => (
              <div key={event.id} className={styles.eventCard + ' glass'}>
                <div className={styles.eventTime}>{event.time}</div>
                <div className={styles.eventInfo}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventLocation}>{event.location}</p>
                </div>
                <div className={`${styles.eventStatus} ${event.completed ? styles.completed : ''}`}>
                  {event.completed && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>

      <nav className={styles.bottomNav + ' glass'}>
        <button className={`${styles.navItem} ${activeTab === 'timeline' ? styles.active : ''}`} onClick={() => setActiveTab('timeline')}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Timeline
        </button>
        <button className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`} onClick={() => setActiveTab('map')}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          Carte
        </button>
        <button className={`${styles.navItem} ${activeTab === 'album' ? styles.active : ''}`} onClick={() => setActiveTab('album')}>
          <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Album
        </button>
      </nav>
    </div>
  );
}
