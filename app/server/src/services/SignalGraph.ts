export interface SignalNode {
    id: string;
    label: string;
    dependencies: string[];
    state: 'UNTESTED' | 'TESTING' | 'CONFIRMED' | 'ADEQUATE' | 'WEAK' | 'DISQUALIFYING';
    weight: number;
}

export const TECHNICAL_SIGNALS: Record<string, SignalNode> = {
    'JS_FUNDAMENTALS': {
        id: 'js_fundamentals',
        label: 'JS Fundamentals',
        dependencies: [],
        state: 'UNTESTED',
        weight: 1.0
    },
    'ASYNC_REASONING': {
        id: 'async_reasoning',
        label: 'Async Reasoning',
        dependencies: ['JS_FUNDAMENTALS'],
        state: 'UNTESTED',
        weight: 1.2
    },
    'ERROR_HANDLING': {
        id: 'error_handling',
        label: 'Error Handling',
        dependencies: ['ASYNC_REASONING'],
        state: 'UNTESTED',
        weight: 0.8
    },
    'STATE_MANAGEMENT': {
        id: 'state_management',
        label: 'State Management',
        dependencies: ['JS_FUNDAMENTALS'],
        state: 'UNTESTED',
        weight: 1.0
    },
    'REACT_HOOKS': {
        id: 'react_hooks',
        label: 'React Hooks',
        dependencies: ['STATE_MANAGEMENT'],
        state: 'UNTESTED',
        weight: 0.9
    },
    'EVENT_LOOP': {
        id: 'event_loop',
        label: 'Event Loop Intuition',
        dependencies: ['ASYNC_REASONING'],
        state: 'UNTESTED',
        weight: 1.5
    }
};

export class SignalGraph {
    private nodes: Map<string, SignalNode>;

    constructor() {
        this.nodes = new Map(Object.entries(TECHNICAL_SIGNALS));
    }

    /**
     * Identifies the next riskiest signal that is ready to be tested.
     * A signal is ready if all its dependencies are CONFIRMED or ADEQUATE.
     */
    getNextRiskiestSignal(): SignalNode | null {
        const candidateNodes = Array.from(this.nodes.values()).filter(node =>
            node.state === 'UNTESTED' &&
            this.areDependenciesMet(node)
        );

        if (candidateNodes.length === 0) return null;

        // Sort by weight (highest risk weight first)
        return candidateNodes.sort((a, b) => b.weight - a.weight)[0];
    }

    updateSignalState(id: string, state: SignalNode['state']): void {
        const node = this.nodes.get(id);
        if (node) {
            node.state = state;
        }
    }

    private areDependenciesMet(node: SignalNode): boolean {
        return node.dependencies.every(depId => {
            const depNode = this.nodes.get(depId);
            return depNode && (depNode.state === 'CONFIRMED' || depNode.state === 'ADEQUATE');
        });
    }

    getGraphState(): Record<string, SignalNode['state']> {
        const state: Record<string, SignalNode['state']> = {};
        this.nodes.forEach((node, id) => {
            state[id] = node.state;
        });
        return state;
    }
}
