'use client';
import { useState } from 'react';
import axios from 'axios';

export default function CreatePoll() {
    const [form, setForm] = useState({ title: '', description: '', pollType: 0, deadline: '', options: ['', ''] });
    const [images, setImages] = useState<File[]>([]);

    const handleAddOption = () => setForm({ ...form, options: [...form.options, ''] });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description);
        data.append('pollType', form.pollType.toString());
        data.append('deadline', Math.floor(new Date(form.deadline).getTime() / 1000).toString());

        const finalOptions = form.pollType === 0 ? ['False', 'True'] : form.options;
        data.append('options', JSON.stringify(finalOptions));

        images.forEach(img => data.append('images', img));

        await axios.post('http://localhost:4000/polling/create', data);
        alert('Official government poll initialized successfully!');
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 max-w-xl mx-auto space-y-4">
            <input className="border p-2 w-full text-black" placeholder="Poll Title" onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="border p-2 w-full text-black" placeholder="Detailed Description" onChange={e => setForm({ ...form, description: e.target.value })} required />
            <select className="border p-2 w-full text-black" onChange={e => setForm({ ...form, pollType: parseInt(e.target.value) })}>
                <option value={0}>True / False</option>
                <option value={1}>Multiple Choice</option>
            </select>
            {form.pollType === 1 && form.options.map((opt, i) => (
                <input key={i} className="border p-2 w-full text-black" placeholder={`Option ${i + 1}`} onChange={e => {
                    const updated = [...form.options];
                    updated[i] = e.target.value;
                    setForm({ ...form, options: updated });
                }} required />
            ))}
            {form.pollType === 1 && <button type="button" onClick={handleAddOption} className="bg-blue-500 text-white px-4 py-2 rounded">Add Choice</button>}
            <input type="datetime-local" className="border p-2 w-full text-black" onChange={e => setForm({ ...form, deadline: e.target.value })} required />
            <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files || []).slice(0, 5))} />
            <button type="submit" className="bg-green-500 text-white p-3 w-full rounded">Launch Official Ballot</button>
        </form>
    );
}