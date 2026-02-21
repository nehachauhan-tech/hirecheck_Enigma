
import { DecisionEngine } from './DecisionEngine';
import { SignalExtractor } from './SignalExtractor';
import { ProbePlanner } from './ProbePlanner';
import { FairnessLayer } from './FairnessLayer';

/**
 * Amazon Bar Raiser Test Case 1: The "Bluffer"
 * - Uses "We" instead of "I"
 * - No metrics
 * - Vague technical jargon (Tech Slop)
 */
const blufferInput = "We improved the API response time significantly by using the latest industry standards and following best practices in the MERN stack.";

/**
 * Amazon Bar Raiser Test Case 2: The "Expert"
 * - Uses "I" 
 * - Concrete metrics (ms, %)
 * - Clear tradeoffs
 */
const expertInput = "I reduced the API tail latency (p99) from 450ms to 120ms (a 73% improvement) by implementing a localized Redis LRU cache for the frequently accessed product metadata. However, I accepted a slightly higher memory footprint to achieve this speed.";

console.log("=== EXECUTING BAR RAISER TEST: THE BLUFFER ===");
const blufferResult = DecisionEngine.analyze(blufferInput, 'Amazon', 1, 0);
console.log(`Loss Score: ${blufferResult.lossScore}`);
console.log(`Trace: \n${blufferResult.verdictTrace.join('\n')}`);
console.log(`Planned Probe: ${blufferResult.probe.type} - ${blufferResult.probe.instruction}`);

console.log("\n=== EXECUTING BAR RAISER TEST: THE EXPERT ===");
const expertResult = DecisionEngine.analyze(expertInput, 'Amazon', 1, 0);
console.log(`Loss Score: ${expertResult.lossScore}`);
console.log(`Trace: \n${expertResult.verdictTrace.join('\n')}`);
console.log(`Planned Probe: ${expertResult.probe.type} - ${expertResult.probe.instruction}`);
