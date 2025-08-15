import React, { useState } from 'react';
import axios from 'axios';

const PitchDeckGenerator = () => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [pitchDeck, setPitchDeck] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fonction pour envoyer la requête POST à l'API
    const generatePitchDeck = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8000/generate-pitch-deck', {
                company_name: companyName,
                description: description,
                target_audience: targetAudience,
            });
            setPitchDeck(response.data.pitch_deck);  // Afficher le pitch deck généré
        } catch (err) {
            setError('Erreur lors de la génération du pitch deck');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Générateur de Pitch Deck</h1>
            <div>
                <label>Nom de l'entreprise:</label>
                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                />
            </div>
            <div>
                <label>Description de l'entreprise:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label>Cible du public:</label>
                <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                />
            </div>
            <div>
                <button onClick={generatePitchDeck} disabled={loading}>
                    {loading ? 'Chargement...' : 'Générer le Pitch Deck'}
                </button>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {pitchDeck && (
                <div>
                    <h2>Pitch Deck généré :</h2>
                    <pre>{pitchDeck}</pre>
                </div>
            )}
        </div>
    );
};

export default PitchDeckGenerator;
