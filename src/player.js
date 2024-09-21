export class Player {
    constructor(id = null) {
        this.id = id;
        this.points = 0;
        this.name = this.generateFunName();
        this.color = this.generateRandomColor();
        this.solvedCells = [];
    }

    generateFunName() {
        const adjectives = [
            "Swift", "Puzzling", "Clever", "Speedy", "Brainy",
            "Nimble", "Quick", "Witty", "Zippy", "Dazzling",
            "Genius", "Lightning", "Mastermind", "Whizbang", "Stellar"
        ];

        const nouns = [
            "Solver", "Sudoku", "Player", "Wizard", "Champion",
            "Master", "Guru", "Ninja", "Prodigy", "Whiz",
            "Ace", "Expert", "Savant", "Brainiac", "Dynamo"
        ];

        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

        return `${randomAdjective}${randomNoun}`;
    }

    setId(id) {
        this.id = id;
    }

    addPoints(points) {
        this.points += points;
    }

    setName(name) {
        this.name = name;
    }

    getScore() {
        return this.points;
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    resetScore() {
        this.points = 0;
    }

    getState() {
        return {
            id: this.id,
            name: this.name,
            points: this.points,
            color: this.color,
            solvedCells: this.solvedCells
        };
    }

    setState(state) {
        this.id = state.id;
        this.name = state.name;
        this.points = state.points;
        this.color = state.color;
        this.solvedCells = state.solvedCells || [];
    }
}