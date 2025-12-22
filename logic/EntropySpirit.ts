
export class EntropySpirit {
    name: string;
    baseDamage: number;
    frequency: number; // Probability of attack per day (0.0 - 1.0)

    constructor(name: string, baseDamage: number, frequency: number) {
        this.name = name;
        this.baseDamage = baseDamage;
        this.frequency = frequency;
    }

    /**
     * Calculates damage after applying Defense mitigation.
     * Formula: Final Damage = Base * e^(-k * Defense)
     * k = 0.05 (diminishing returns scaling factor)
     */
    calculateMitigation(defenseSkill: number): number {
        const K = 0.05;
        const mitigation = Math.exp(-K * defenseSkill);
        return Math.round(this.baseDamage * mitigation);
    }

    /**
     * Determines if the spirit attacks today based on frequency.
     */
    willAttack(): boolean {
        return Math.random() < this.frequency;
    }
}

// Predefined Spirits
export const ENTROPY_SPIRITS = {
    WEED_SPIRIT: new EntropySpirit("Weed Spirit", 20, 0.3), // Low damage, frequent
    ROT_SPIRIT: new EntropySpirit("Rot Spirit", 50, 0.1),   // Med damage, random
    VOID_SPIRIT: new EntropySpirit("Void Spirit", 100, 0.05) // High damage, rare
};
