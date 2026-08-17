'use client';

import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('nexore_quick_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Notlar yüklenirken hata oluştu", e);
      }
    }
  }, []);

  const saveToLocalStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('nexore_quick_notes', JSON.stringify(updatedNotes));
  };

  const handleAddOrUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (isEditing) {
      const updated = notes.map((note) => 
        note.id === isEditing ? { ...note, title, content } : note
      );
      saveToLocalStorage(updated);
      setIsEditing(null);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Başlıksız Not',
        content,
        date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      saveToLocalStorage([newNote, ...notes]);
    }
    setTitle('');
    setContent('');
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(note.id);
  };

  const handleDelete = (id: string) => {
    const filtered = notes.filter((note) => note.id !== id);
    saveToLocalStorage(filtered);
  };

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/50">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span>📌</span> Hızlı Notlarım
        </h2>
        <div className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold">
          {notes.length} Aktif Not
        </div>
      </div>

      <form onSubmit={handleAddOrUpdateNote} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Not başlığı ekle..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400"
        />
        <textarea
          placeholder="Düşüncelerini buraya not et..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-5 py-3 rounded-2xl border-0 bg-white/50 focus:ring-2 focus:ring-purple-500/20 text-gray-700 placeholder-gray-400 resize-none"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
        >
          {isEditing ? 'Notu Güncelle' : 'Notu Kaydet'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-bold text-gray-800 mb-2">{note.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
              <span>{note.date}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(note)} className="text-purple-600 font-medium">Düzenle</button>
                <button onClick={() => handleDelete(note.id)} className="text-rose-500 font-medium">Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}