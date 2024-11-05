"use client";

import { useState } from 'react';
import ImageGenerator from './ImageGenerator';

export default function ImageGeneratorWrapper({ initialUser }: { initialUser: any }) {
    const [user, setUser] = useState(initialUser);

    const handleCreditsUpdate = (newCredits: number) => {
        setUser((prevUser: any) => ({
            ...prevUser,
            credits: newCredits
        }));
    };

    return (
        <ImageGenerator 
            user={user} 
            onCreditsUpdate={handleCreditsUpdate}
        />
    );
}
