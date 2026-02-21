
import axios from 'axios';

// Base URL for the Alfa LeetCode API (Free/Open Source)
const LEETCODE_API_URL = 'https://alfa-leetcode-api.onrender.com';

export interface LeetCodeProblem {
    questionId: string;
    title: string;
    titleSlug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    content: string; // HTML content
    topicTags: { name: string }[];
    codeSnippets: { lang: string; code: string }[];
}

export class LeetCodeService {

    /**
     * Fetches the Daily Challenge from LeetCode
     */
    async getDailyChallenge(): Promise<LeetCodeProblem | null> {
        try {
            const response = await axios.get(`${LEETCODE_API_URL}/daily`);
            const data = response.data;

            // The daily endpoint might just return the titleSlug, so we need to fetch details
            const titleSlug = data.questionLink ? data.questionLink.split('/problems/')[1].replace('/', '') : data.questionTitleSlug;

            return this.getProblemDetails(titleSlug);
        } catch (error) {
            console.error('Failed to fetch daily challenge:', error);
            return null;
        }
    }

    /**
     * Fetches detailed problem data by titleSlug
     */
    async getProblemDetails(titleSlug: string): Promise<LeetCodeProblem | null> {
        try {
            const response = await axios.get(`${LEETCODE_API_URL}/select?titleSlug=${titleSlug}`);
            const p = response.data;

            return {
                questionId: p.questionId,
                title: p.questionTitle,
                titleSlug: p.titleSlug,
                difficulty: p.difficulty,
                content: p.content,
                topicTags: p.topicTags || [],
                codeSnippets: p.codeSnippets || []
            };
        } catch (error) {
            console.error(`Failed to fetch problem details for ${titleSlug}:`, error);
            return null;
        }
    }

    /**
     * Fetches a list of problems by tag (e.g., "array", "dynamic-programming")
     */
    async getProblemsByTag(tag: string, limit: number = 20): Promise<any[]> {
        try {
            // Note: The Alfa API might have specific endpoints for tags or requires searching
            // Falling back to a known endpoint structure or returning empty if not supported directly
            // Real implementation would rely on specific API capabilities
            const response = await axios.get(`${LEETCODE_API_URL}/problems?limit=${limit}&tags=${tag}`);
            return response.data.problemsetQuestionList || [];
        } catch (error) {
            console.error(`Failed to fetch problems for tag ${tag}:`, error);
            return [];
        }
    }

    /**
     * Adapt the LeetCode format to our internal 'Problem' interface
     */
    adaptToInternalFormat(lcProblem: LeetCodeProblem): any {
        const starterCode: Record<string, string> = {};

        // Map LeetCode languages to our internal keys
        lcProblem.codeSnippets.forEach(snippet => {
            const lang = snippet.lang.toLowerCase();
            if (lang === 'java' || lang === 'cpp' || lang === 'python' || lang === 'python3' || lang === 'javascript' || lang === 'typescript') {
                // Normalize keys
                const key = lang === 'python3' ? 'python' : lang;
                starterCode[key] = snippet.code;
            }
        });

        // Strip HTML from content for description (basic implementation)
        // A real implementation would use a proper HTML-to-Markdown converter or sanitization
        const description = lcProblem.content.replace(/<[^>]*>?/gm, '');

        return {
            id: lcProblem.titleSlug,
            title: lcProblem.title,
            difficulty: lcProblem.difficulty.toLowerCase(),
            category: lcProblem.topicTags[0]?.name || 'Algorithms',
            description,
            starterCode,
            testCases: [] // LeetCode API doesn't always expose hidden test cases publicly
        };
    }
}
