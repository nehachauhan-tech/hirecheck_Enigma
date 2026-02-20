
import { DecisionEngine } from './DecisionEngine';
import { ProbeType } from './ProbePlanner';

async function runVerification() {
    console.log('--- STARTING PHASE 8 SURGICAL ROUTING VERIFICATION ---');

    const sessionId = 'VERIFY_P8_' + Date.now();
    const company = 'Amazon';
    const category = 'MERN Stack';

    // TEST 1: Plural Ownership Detection (Surgical Mapping)
    console.log('\n[Test 1] Testing Plural Ownership ("WE") response...');
    const result1 = DecisionEngine.analyze(
        "We built the entire frontend and we integrated the database as a team.",
        company,
        2,
        0,
        sessionId,
        category
    );

    console.log('Detected Probe:', result1.probe.type);
    console.log('Target Weakness:', result1.probe.targetWeakness);
    console.log('Instruction:', result1.probe.instruction);

    if (result1.probe.type === ProbeType.RECONSTRUCTION && result1.probe.targetWeakness === 'Individual Agency') {
        console.log('✅ PASS: Correctly routed to Ownership Isolation Probe.');
    } else {
        console.log('❌ FAIL: Ownership stance not mapped to reconstruction.');
    }

    // TEST 2: Dogmatic Thinking (Pattern Spam Detection)
    console.log('\n[Test 2] Testing Dogmatic Thinking ("Clean Code", "SOLID", etc.)...');
    const result2 = DecisionEngine.analyze(
        "I always follow Clean Code and SOLID principles because it is the industry standard for best practices.",
        company,
        3,
        0,
        sessionId,
        category
    );

    console.log('Detected Probe:', result2.probe.type);
    console.log('Instruction:', result2.probe.instruction);

    if (result2.probe.type === ProbeType.INVERSION && result2.probe.targetWeakness === 'Dogmatic Thinking') {
        console.log('✅ PASS: Correctly routed to Dogmatic Inversion Probe.');
    } else {
        console.log('❌ FAIL: Dogmatic markers not triggered.');
    }

    // TEST 3: Category-Aware Failure Injection (MERN Stack)
    console.log('\n[Test 3] Testing Category-Aware Scenario (MERN)...');
    const result3 = DecisionEngine.analyze(
        "I can handle Node.js performance issues.",
        company,
        3,
        0, // No code churn
        sessionId,
        category
    );

    console.log('Detected Probe:', result3.probe.type);
    console.log('Instruction:', result3.probe.instruction);

    if (result3.probe.instruction.includes('Event Loop') || result3.probe.targetWeakness === 'Node/JS Internals') {
        console.log('✅ PASS: Correctly routed to MERN-specific Failure Injection.');
    } else {
        console.log('❌ FAIL: Category scenario not detected.');
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

runVerification().catch(console.error);
