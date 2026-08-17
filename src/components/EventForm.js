import { useState, useEffect } from 'react';
import styles from './EventForm.module.css';
import PhotoUploader from './PhotoUploader';

export default function EventForm({ initialData = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
    notes_celeste: '',
    notes_julie: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        time: initialData.time || '12:00',
        location: initialData.location || '',
        notes_celeste: initialData.notes_celeste || '',
        notes_julie: initialData.notes_julie || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Erreur lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass animate-fade-in`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{initialData ? 'Modifier l\'étape' : 'Nouvelle étape'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Titre</label>
            <input className={styles.input} type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Ex: Arrivée à PEK" />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <input className={styles.input} type="date" name="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Heure</label>
              <input className={styles.input} type="time" name="time" required value={formData.time} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Adresse / Coordonnées</label>
            <input className={styles.input} type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Lieu" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes Céleste</label>
            <textarea className={styles.textarea} name="notes_celeste" value={formData.notes_celeste} onChange={handleChange} rows="2" placeholder="Notes personnelles..."></textarea>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes Julie</label>
            <textarea className={styles.textarea} name="notes_julie" value={formData.notes_julie} onChange={handleChange} rows="2" placeholder="Notes personnelles..."></textarea>
          </div>

          {initialData && (
            <div className={styles.formGroup} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <label className={styles.label}>Souvenirs (Photos)</label>
              <PhotoUploader eventId={initialData.id} onUploadSuccess={() => alert('Photo ajoutée avec succès !')} />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>Annuler</button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? '...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
