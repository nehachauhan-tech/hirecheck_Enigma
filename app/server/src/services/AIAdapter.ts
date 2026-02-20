import Groq from 'groq-sdk';
import { AlgorithmicPersona } from './AlgorithmicPersona';
import { companyData } from '../data/company-dna';
import { DecisionEngine, DecisionState } from './DecisionEngine';
import { ProbeType } from './ProbePlanner';

interface AIResponse {
  message: string;
  intent?: string;
  confidence?: number;
  probingStage?: number; // The stage used for this response
}

interface ProblemContext {
  title: string;
  description: string;
  difficulty: string;
  category: string;
}

interface InterviewContext {
  state: string;
  code: string;
  previousMessages: string[];
  behavioralMetrics: any;
  persona?: 'Priya' | 'Arjun' | 'Vikram' | 'Karan';
  mode?: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass' | 'behavioral';
  resumeText?: string;
  emotionalState?: string;
  targetCompany?: string;
  targetRole?: string;
  experienceLevel?: string;
  roundScopedMemory?: {
    lastSummary: string;
    activeRisks: string[];
  };
  probeIntent?: string;
  level?: 200 | 300 | 400 | 'SOS' | 'OUT';
  probingStage?: number;
}

export class AIAdapter {
  private GROQ_KEY = '';
  private groq: Groq | null = null;

  private personas = {
    Priya: {
      name: 'Priya',
      role: 'Staff Engineer & Mentor',
      style: 'Focuses on architectural patterns and clean abstractions. Empathetic but technically rigorous. Values TDD and readable code.',
      catchphrase: 'Don\'t worry, let\'s think through the edge cases together.'
    },
    Arjun: {
      name: 'Arjun',
      role: 'Principal Solutions Architect',
      style: 'Professional and deep-thinking. Obsessed with high availability and distributed systems. You challenge assumptions naturally within the conversation. Avoid lecturing; instead, probe for depth with technical curiosity.',
      catchphrase: 'That works, but how does it behave under a 100x spike in traffic?'
    },
    Vikram: {
      name: 'Vikram',
      role: 'Engineering Lead',
      style: 'Pragmatic and delivery-focused. Questions dependencies, security vulnerabilities, and production monitoring.',
      catchphrase: 'Good implementation. Now, how do we make this production-hardened and observable?'
    },
    Karan: {
      name: 'Karan',
      role: 'Lead Authority Interviewer',
      style: 'PRINCIPAL BAR-RAISER & Measurement Specialist. Your tone is clinical, authoritative, and professional. Start with a calm, professional acknowledgment. Use HINGLISH ONLY when it adds natural emphasis—do not overdo it. Use Socratic Scaffolding to lead the candidate to deeper answers. Zero tolerance for fluff.',
      catchphrase: 'Answer directly.'
    }
  };

  constructor() {
    this.GROQ_KEY = process.env.GROQ_API_KEY || '';
    console.log('[AIAdapter] Initializing... Has Key:', !!this.GROQ_KEY);
    if (this.GROQ_KEY) {
      this.groq = new Groq({ apiKey: this.GROQ_KEY });
    }
  }

  async generateInterviewerMessage(
    context: InterviewContext,
    problem: ProblemContext
  ): Promise<AIResponse> {
    const persona = this.personas[context.persona || 'Vikram'];

    const codeChurn = context.behavioralMetrics?.codeChurn || 0;
    const currentStage = context.probingStage || 1;

    // 1. PHASE 1 & 2: Deterministic Decision
    const decision = DecisionEngine.analyze(
      context.previousMessages[context.previousMessages.length - 1] || '',
      context.targetCompany || 'Amazon',
      currentStage,
      codeChurn > 0.2 ? 5 : 0,
      (context as any).sessionId || 'ANONYMOUS',
      problem.category,
      context.mode
    );

    // 2. PHASE 3: Micro-contract for the Actor
    let activePersona = persona;
    let collabNote = '';

    // EXPERT: Persona Collab (Shadow Interviewer)
    // REMOVED: User prefers consistent personas. Intervention logic disabled.
    /*
    if (decision.lossScore > 0.7 &&
      decision.probe.type === ProbeType.RECONSTRUCTION &&
      context.persona !== 'Arjun' &&
      context.mode !== 'compass') {
      activePersona = this.personas['Arjun'];
      collabNote = `[SYSTEM]: Arjun (Principal Architect) has entered to audit your architectural fundamentals.`;
    }
    */

    const systemPrompt = this.buildMicroContract(activePersona, context, decision);
    const userPrompt = this.buildActorUserPrompt(context, decision);

    try {
      if (this.groq) {
        const response = await this.generateGroqResponse(systemPrompt, userPrompt);
        // Add Decision Trace to the response (Step 8 of User Request)
        if (collabNote) response.message = `${collabNote}\n\n${response.message}`;
        // REMOVED Trace from user-facing message
        // response.message += `\n\n[Decision Trace]:\n${decision.verdictTrace.join('\n')}`;
        response.probingStage = decision.probe.stage;
        return response;
      }
      throw new Error('Groq provider not available');
    } catch (error) {
      console.error('AI provider failed:', error);
      return this.getFallbackResponse(context.state, persona);
    }
  }

  private buildMicroContract(persona: any, context: InterviewContext, decision: DecisionState): string {
    const dna = Object.values(companyData).find(c =>
      c.name.toLowerCase() === context.targetCompany?.toLowerCase()
    );

    return `ROLE: ${persona.name} (${persona.role})
PROBE_CLASS: ${decision.probe.type}
TARGET: ${decision.probe.targetWeakness}
COMPANY: ${context.targetCompany || 'FAANG'}
LOSS_SCORE: ${decision.lossScore.toFixed(2)}
INSTRUCTION: ${decision.probe.instruction}
COMPANY_SPECIFIC_DNA: ${AlgorithmicPersona.getCompanyInstruction(dna)}
RULES:
- Respond naturally and professionally.
- No explanation of why you are asking the question.
- Avoid mechanical or robotic phrasing.
- Balance authority with technical curiosity.
- Current Mode: ${context.mode || 'Technical Assessment'}.`;
  }

  private buildActorUserPrompt(context: InterviewContext, decision: DecisionState): string {
    return `CANDIDATE_INPUT: "${context.previousMessages[context.previousMessages.length - 1] || ''}"
CURRENT_CODE: ${context.code || 'None'}
DECISION_TRACE: ${decision.verdictTrace.join(', ')}
ACTOR_TASK: Execute the ${decision.probe.type} probe now.`;
  }

  private async generateGroqResponse(system: string, user: string): Promise<AIResponse> {
    if (!this.groq) throw new Error('Groq not configured');

    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      model: 'llama-3.1-8b-instant',
      max_tokens: 50,
    });

    console.log('[AIAdapter] Groq call successful');
    return {
      message: completion.choices[0]?.message?.content || '',
      intent: 'general',
      confidence: 0.9
    };
  }

  // Legacy prompts removed. Actor uses rebuildMicroContract.

  // Legacy buildUserPrompt removed.

  private getFallbackResponse(state: string, persona: any, context?: InterviewContext): AIResponse {
    const fallbacks: Record<string, string> = {
      'INTRO': context?.persona === 'Karan' ? `Hi, I'm Karan. I see you're applying for the ${context.targetRole || 'Full-Stack'} role with ${context.experienceLevel || 'your'} experience. Let's start the briefing.` : `Welcome! I'm ${persona.name}. Ready to dive in?`,
      'THEORY': context?.persona === 'Karan' ? "Incorrect. Explain the architectural trade-offs." : "Tell me more about how you'd handle that.",
      'PRACTICAL': context?.persona === 'Karan' ? "Stop. Logic is flawed. Redo the implementation." : "How are you thinking about the implementation?",
      'REVIEW': context?.persona === 'Karan' ? "Analysis rejected. What breaks first?" : "What would you do differently next time?"
    };

    const defaultMsg = context?.persona === 'Karan'
      ? "Stop. Answer directly. No excuses."
      : "That's an interesting technical direction. Can you expand?";

    return {
      message: fallbacks[state] || defaultMsg,
      intent: 'fallback',
      confidence: 1.0
    };
  }

  async generatePersonaChat(
    context: InterviewContext,
    problem: ProblemContext,
    userMessage: string,
    currentCode: string
  ): Promise<AIResponse> {
    const persona = this.personas[context.persona || 'Vikram'];

    const codeChurn = context.behavioralMetrics?.codeChurn || 0;
    const currentStage = context.probingStage || 1;

    // 1. PHASE 1 & 2: Deterministic Decision for Chat
    const decision = DecisionEngine.analyze(
      userMessage,
      context.targetCompany || 'Amazon',
      currentStage,
      codeChurn > 0.2 ? 5 : 0,
      (context as any).sessionId || 'ANONYMOUS',
      context.roundScopedMemory?.lastSummary || 'General',
      context.mode
    );

    const systemPrompt = this.buildMicroContract(persona, context, decision);
    const userPrompt = `CANDIDATE_CHAT: "${userMessage}"
CODE_STATE: ${currentCode || 'None'}
DECISION: ${decision.probe.type} on ${decision.probe.targetWeakness}`;

    try {
      if (this.groq) {
        const response = await this.generateGroqResponse(systemPrompt, userPrompt);
        // REMOVED Trace from user-facing message
        // response.message += `\n\n[Audit Trace]: ${decision.verdictTrace.slice(0, 2).join(' | ')}`;
        response.probingStage = decision.probe.stage;
        return response;
      }
      throw new Error('Groq not available');
    } catch (error) {
      console.error('[AIAdapter] Persona chat failed:', error);
      return this.getFallbackResponse(context.state, persona);
    }
  }

  async auditResumeAgainstCompany(
    resumeText: string,
    companyName: string,
    role: string = 'Full-Stack (MERN)'
  ): Promise<any> {
    console.log(`[AIAdapter] Auditing resume against ${companyName} for role ${role}`);

    // Robust lookup
    const dna = Object.values(companyData).find(c =>
      c.name.toLowerCase() === companyName.toLowerCase() ||
      companyName.toLowerCase().includes(c.name.toLowerCase())
    ) || {
      name: companyName,
      category: 'Product MNC' as const,
      interviewStyle: 'Technical Interview',
      focusAreas: ['General MERN Stack', 'System Design'],
      secretTriggers: ['Core fundamentals', 'Project ownership'],
      rejectionSignals: ['Lack of fundamentals', 'Vague impact'],
      roleSpecifics: {
        [role]: { mandatorySkills: ['React', 'Node.js', 'JavaScript'], expectations: [] }
      }
    };

    const systemPrompt = `You are Karan, Lead Corporate Interviewer and Resume Strategist at a top-tier firm.
Your task is to perform a high-fidelity, evidence-based audit of a candidate's resume against ${companyName}'s 2025 hiring benchmarks.

COMPANY DNA (${companyName}):
- FOCUS AREAS: ${dna.focusAreas?.join(', ') || 'General Excellence'}
- SECRET TRIGGERS (What they love): ${dna.secretTriggers?.join(', ')}
- REJECTION SIGNALS (Red flags): ${dna.rejectionSignals?.join(', ')}
- MANDATORY SKILLS: ${dna.roleSpecifics && dna.roleSpecifics[role] ? dna.roleSpecifics[role].mandatorySkills.join(', ') : 'Standard MERN Stack'}

EVALUATION CRITERIA:
1. Be extremely critical. ${companyName} has high standards.
2. LOOK FOR EVIDENCE. If they say they know "React", look for "Redux", "Hooks", or "Performance" in context.
3. MATCH AGAINST TRIGGERS. If ${companyName} values "Scale", and the resume doesn't mention "Traffic", "Optimization", or "Millions", that's a GAP.
4. IDENTIFY REJECTION SIGNALS. Does the resume show signs of "Vague implementations" or "Low agency"?

OUTPUT FORMAT (STRICT JSON):
{
  "score": number (0-100),
  "matches": string[] (Skills/experiences that explicitly match DNA),
  "gaps": string[] (Specific missing evidence or weak signals relative to DNA),
  "verdict": string (1-2 sentences of clinical, honest feedback),
  "actionableAdvice": string[] (3-5 concrete steps to fix the gaps before the loop)
}

[STRICT RULE: Do NOT be generic. Mention ${companyName} specific requirements in your verdict and advice.]`;

    const userPrompt = `RESUME CONTENT:
${resumeText}

INTERVIEWER: Evaluate this resume against ${companyName} for the ${role} position. Respond ONLY with the JSON object.`;

    try {
      // Late-init recovery if keys were missing during constructor
      if (!this.groq && process.env.GROQ_API_KEY) {
        console.log('[AIAdapter] Late initializing Groq...');
        this.GROQ_KEY = process.env.GROQ_API_KEY;
        this.groq = new Groq({ apiKey: this.GROQ_KEY });
      }

      if (this.groq) {
        console.log('[AIAdapter] Calling Groq for resume audit...');
        const completion = await this.groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content || '{}';
        console.log('[AIAdapter] Audit content received (length):', content.length);

        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('[AIAdapter] JSON Parse Error. Content:', content);
          throw parseError;
        }
      }
      throw new Error('Groq not available even after late-init attempt');
    } catch (error: any) {
      console.error('[AIAdapter] Resume audit failed CRITICALLY:', error.message || error);
      // Data-driven fallback relative to company
      return {
        score: 65,
        matches: ['MERN Stack Fundamentals'],
        gaps: [`Evidence of ${dna.focusAreas[0]}`, `Alignment with ${companyName} Secret Triggers`],
        verdict: `Your foundation is acceptable, but your resume fails to project the specific "DNA" required for ${companyName}. More evidence of ${dna.secretTriggers[0]} is needed.`,
        actionableAdvice: [
          `Quantify your impact using metrics relevant to ${dna.category} standards.`,
          `Explicitly highlight your experience with ${dna.focusAreas.slice(0, 2).join(', ')}.`,
          `Refactor project descriptions to align with ${companyName}'s focus on ${dna.interviewStyle.split(' ')[0]}.`
        ]
      };
    }
  }

  async generateExplanation(context: string): Promise<string> {
    // Legacy support: redirect to a generic chat if needed, 
    // but we should favor generatePersonaChat
    if (this.groq) {
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'system', content: "You are a senior developer. Provide a 2-sentence technical explanation." }, { role: 'user', content: context }],
        model: 'llama-3.1-8b-instant',
      });
      return completion.choices[0]?.message?.content || "I'm having trouble analyzing that specific part right now.";
    }
    return "That's an interesting implementation. How would you optimize this for production?";
  }
}
