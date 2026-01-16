/**
 * Concept reference mapping utilities
 */

// Manual mappings for known corrections
export const manualMappings: Record<string, string> = {
    // Plural -> Singular
    'burnouts': 'burnout',
    'anxieties': 'anxiety',
    'stresses': 'stress-response',
    'motivations': 'motivation',
    'feedbacks': 'feedback-loops',
    'routines': 'daily-routine',
    'philosophies': 'philosophy',
    'organizations': 'organizational-culture',
    'relationships': 'social-capital',
    'communications': 'communication',
    'competitions': 'competitive-advantage',

    // Typos / alternate names
    'large-language-model': 'large-language-models',
    'environmental-design': 'environment-design',
    'first-principles-thinking': 'first-principles',
    'gamblers-fallacy': 'gambler-fallacy',
    'parkinsons-law': 'parkinson-law',
    'knowledge-workers': 'knowledge-worker',
    'timeboxing': 'time-boxing',
    'regression-to-mean': 'regression-to-the-mean',
    'paying-it-forward': 'pay-it-forward',

    // Conceptual mappings
    'habits': 'habit-loop',
    'habit-formation': 'habit-loop',
    'behavior-change': 'behavioral-activation',
    'productivity': 'knowledge-work-productivity',
    'creativity': 'creative-thinking',
    'meditation': 'mindfulness-meditation',
    'reflection': 'reflective-thinking',
    'empathy': 'empathic-listening',
    'happiness': 'happiness-practices',
    'networking': 'networked-thought',
    'iteration': 'iterative-note-taking',
    'experimentation': 'experimental-mindset',
    'wisdom': 'wisdom-of-crowds',
    'procrastination': 'procrastination-equation',
    'sleep': 'sleep-architecture',
    'automation': 'automating-processes',
    'meaning': 'meaningful-pursuits',
    'learning': 'learning-curve',
    'decision-making': 'decision-matrix',

    // Remove these (no good mapping, too generic)
    'self-awareness': '',
    'well-being': '',
    'ethics': '',
    'collaboration': '',
    'cognitive-biases': '',
    'buddhism': '',
    'boundaries': '',
    'virtue': '',
    'acceptance': '',
    'willpower': '',
    'self-control': '',
    'trust': '',
    'presence': '',
    'planning': '',
    'momentum': '',
    'vulnerability': '',
    'recovery': '',
    'balance': '',
    'harmony': '',
    'integration': '',
    'enlightenment': '',
    'knowledge': '',
    'education': '',
    'incubation': '',
    'cue-routine-reward': '',
    'automaticity': '',
    'friction': '',
    'style': '',
    'professional-writing': '',
    'accountability': '',
    'fight-or-flight': '',
    'artificial-intelligence': '',
    'learning-analytics': '',
    'platform-thinking': '',
    'building-blocks': '',
    'emergence': '',
    'hypothesis-testing': '',
    'nihilism': '',
    'revolt': '',
    'sisyphus': '',
    'camus': '',
    'goal-specification': '',
    'unintended-consequences': '',
    'fact-checking': '',
    'ai-limitations': '',
    'verifications': '',
    'risk-management': '',
    'responsible-ai': '',
    'ai-governance': '',
    'randomness': '',
    'model-parameters': '',
    'output-control': '',
    'rational-irrationality': '',
    'innovation-mindset': '',
    'breakthrough-thinking': '',
    'ambitious-goals': '',
    'blind-spots': '',
    'tool-use': '',
    'workflow-automation': '',
    'generalization': '',
    'instruction-tuning': '',
    'cooperation': '',
    'value-creation': '',
    'desirable-difficulty': '',
    'negotiation': ''
}

/**
 * Try to find a valid mapping for an invalid concept ID
 */
export function findMapping(invalidId: string, allConceptIds: Set<string>): string | null {
    // Check manual mappings first
    if (invalidId in manualMappings) {
        const mapped = manualMappings[invalidId]
        if (mapped === '') return null // Explicitly remove
        if (allConceptIds.has(mapped)) return mapped
    }

    // Try removing trailing 's' (plural -> singular)
    const singular = invalidId.replace(/s$/, '')
    if (allConceptIds.has(singular)) return singular

    // Try 'ies' -> 'y'
    const yForm = invalidId.replace(/ies$/, 'y')
    if (allConceptIds.has(yForm)) return yForm

    // Try adding 's' (singular -> plural)
    const plural = invalidId + 's'
    if (allConceptIds.has(plural)) return plural

    // Try with hyphens
    const hyphenated = invalidId.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    if (allConceptIds.has(hyphenated)) return hyphenated

    return null
}
