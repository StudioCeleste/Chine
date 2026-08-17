"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { supabase } from '../lib/supabase';
import EventForm from '../components/EventForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
      
    if (!error && data) {
      setEvents(data);
    }
  };

  const handleSaveEvent = async (formData) => {
    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEvent.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      if (error) throw error;
    }
    fetchEvents();
  };

  const toggleCompleted = async (e, event) => {
    e.stopPropagation();
    // Optimistic update
    setEvents(events.map(ev => ev.id === event.id ? { ...ev, completed: !ev.completed } : ev));
    const { error } = await supabase
      .from('events')
      .update({ completed: !event.completed })
      .eq('id', event.id);
    if (error) {
      fetchEvents(); // revert if failed
    }
  };

  const openNewForm = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Grouper les évènements par jour
  const uniqueDates = [...new Set(events.map(e => e.date))].sort();
  const days = events.reduce((acc, event) => {
    const dayIndex = uniqueDates.indexOf(event.date) + 1;
    const dayName = `Jour ${dayIndex}`;
    if (!acc[dayName]) {
      acc[dayName] = { date: event.date, events: [] };
    }
    acc[dayName].events.push(event);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <header className={styles.header + ' animate-fade-in'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>Chine</h1>
            <p className={styles.subtitle}>Chronologie Collaborative</p>
          </div>
          {activeTab === 'timeline' && (
            <button className={styles.addBtn} onClick={openNewForm}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </header>

      <main className={styles.timeline}>
        {activeTab === 'timeline' && Object.keys(days).length === 0 && (
          <div className={styles.emptyState}>
            <p>Aucune étape planifiée.</p>
            <button className={styles.addBtnLg} onClick={openNewForm}>Ajouter une étape</button>
          </div>
        )}

        {activeTab === 'timeline' && Object.entries(days).map(([dayName, data], index) => (
          <section key={dayName} className={styles.daySection + ' animate-fade-in'} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={styles.dayHeader}>
              <div className={styles.dayIndicator}></div>
              <h2 className={styles.dayTitle}>{dayName}</h2>
              <span className={styles.dayDate}>{data.date}</span>
            </div>

            {data.events.map((event) => (
              <div key={event.id} className={styles.eventCard + ' glass'} onClick={() => openEditForm(event)}>
                <div className={styles.eventTime}>{event.time.substring(0, 5)}</div>
                <div className={styles.eventInfo}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventLocation}>{event.location}</p>
                </div>
                <div className={`${styles.eventStatus} ${event.completed ? styles.completed : ''}`} onClick={(e) => toggleCompleted(e, event)}>
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

        {activeTab === 'map' && (
          <div className="animate-fade-in" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Module Cartographie en cours de développement...</p>
          </div>
        )}

        {activeTab === 'album' && (
          <div className="animate-fade-in" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Module Album en cours de développement...</p>
          </div>
        )}
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

      {isFormOpen && (
        <EventForm 
          initialData={editingEvent} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveEvent} 
        />
      )}
    </div>
  );
}
