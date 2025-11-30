export interface Task {
    id: string;
    title: string;
    description?: string;
    url?: string; // URL for this specific task
    completed: boolean;
}

export interface AirdropApp {
    id: string;
    name: string;
    description: string;
    category: 'DeFi' | 'NFT' | 'L2' | 'GameFi' | 'Infrastructure';
    url: string;
    tasks: Task[];
    imageUrl?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    potential: 'High' | 'Medium' | 'Low';
}
