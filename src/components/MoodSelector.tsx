"use client";
import styles from "./MoodSelector.module.css";

interface MoodSelectorProps {
    onMoodSelect: (mood: string) => void;
    selectedMood: string;
}

const MoodSelector = ({ onMoodSelect, selectedMood }: MoodSelectorProps) => {
    const moods = ["Happy", "Sad", "Excited", "Calm", "Anxious", "Romantic"];

    return (
        <div className={styles.moodSelectorContainer}>
            <label htmlFor="mood-select" className={styles.moodLabel}>
                Select Your Mood:
            </label>
            <select
                id="mood-select"
                className={styles.moodSelect}
                value={selectedMood}
                onChange={(e) => onMoodSelect(e.target.value)}
            >
                <option value="">-- Select Mood --</option>
                {moods.map((mood) => (
                    <option key={mood} value={mood}>
                        {mood}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MoodSelector;
