/* eslint-disable */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './AlbumView.module.css';

export default function AlbumView({ events }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPhotos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();

    const channel = supabase
      .channel('schema-db-changes-photos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
        fetchPhotos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Group photos by event
  const eventsWithPhotos = events.map(event => {
    return {
      ...event,
      photos: photos.filter(p => p.event_id === event.id)
    };
  }).filter(event => event.photos.length > 0);

  if (loading) {
    return <div className={styles.loading}>Chargement des souvenirs...</div>;
  }

  if (eventsWithPhotos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Aucun souvenir pour l&apos;instant.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>Ajoutez des photos depuis les détails d&apos;une étape !</p>
      </div>
    );
  }

  return (
    <div className={styles.albumContainer}>
      <div className={styles.generateBtnContainer}>
        <button className={styles.generateBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Générer notre carnet (PDF)
        </button>
      </div>

      <div className={styles.timeline}>
        {eventsWithPhotos.map(event => (
          <div key={event.id} className={styles.eventGroup}>
            <div className={styles.eventHeader}>
              <h3>{event.title}</h3>
              <span>{event.date} - {event.time.substring(0,5)}</span>
            </div>
            
            <div className={styles.photoGrid}>
              {event.photos.map(photo => (
                <div key={photo.id} className={styles.photoCard}>
                  <img src={photo.url_thumbnail} alt="Souvenir" loading="lazy" />
                </div>
              ))}
            </div>
            
            {(event.notes_celeste || event.notes_julie) && (
              <div className={styles.eventNotes}>
                {event.notes_celeste && <p><strong>Céleste:</strong> {event.notes_celeste}</p>}
                {event.notes_julie && <p><strong>Julie:</strong> {event.notes_julie}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
