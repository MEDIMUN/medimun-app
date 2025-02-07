export enum PreambulatoryPhrases {
	Acknowledging = "Acknowledging",
	Acting = "Acting",
	Affirming = "Affirming",
	Alarmed_by = "Alarmed by",
	Alarmed = "Alarmed",
	Anxious = "Anxious",
	Appreciating = "Appreciating",
	Approving = "Approving",
	Aware_of = "Aware of",
	Bearing_in_mind = "Bearing in mind",
	Believing = "Believing",
	Cognizant = "Cognizant",
	Concerned = "Concerned",
	Confident = "Confident",
	Conscious = "Conscious",
	Considering = "Considering",
	Contemplating = "Contemplating",
	Convinced = "Convinced",
	Declaring = "Declaring",
	Deeply_concerned = "Deeply concerned",
	Deeply_conscious = "Deeply conscious",
	Deeply_convinced = "Deeply convinced",
	Deeply_disturbed = "Deeply disturbed",
	Deeply_regretting = "Deeply regretting",
	Deploring = "Deploring",
	Desiring = "Desiring",
	Determined = "Determined",
	Emphasizing = "Emphasizing",
	Encouraged = "Encouraged",
	Expecting = "Expecting",
	Expressing_appreciation = "Expressing appreciation",
	Noting_with_approval = "Noting with approval",
	Expressing_concern_also = "Expressing concern also",
	Expressing_concern = "Expressing concern",
	Expressing_its_appreciation = "Expressing its appreciation",
	Expressing_its_satisfaction = "Expressing its satisfaction",
	Expressing_satisfaction = "Expressing satisfaction",
	Firmlyconvinced = "Firmly convinced",
	Fulfilling = "Fulfilling",
	Fully_alarmed = "Fully alarmed",
	Fully_aware = "Fully aware",
	Fully_believing = "Fully believing",
	Further_deploring = "Further deploring",
	Further_recalling = "Further recalling",
	Guided_by = "Guided by",
	Having_considered = "Having considered",
	Having_considered_further = "Having considered further",
	Having_devoted_attention = "Having devoted attention",
	Having_examined = "Having examined",
	Having_heard = "Having heard",
	Having_received = "Having received",
	Having_reviewed = "Having reviewed",
	Having_studied = "Having studied",
	Having_adopted = "Having adopted",
	Having_approved = "Having approved",
	Having_decided = "Having decided",
	Keeping_in_mind = "Keeping in mind",
	Mindful = "Mindful",
	Noting = "Noting",
	Noting_further = "Noting further",
	Noting_with_deep_concern = "Noting with deep concern",
	Noting_with_regret = "Noting with regret",
	Noting_with_satisfaction = "Noting with satisfaction",
	Observing = "Observing",
	Reaffirming = "Reaffirming",
	Reaffirming_also = "Reaffirming also",
	Realizing = "Realizing",
	Recalling = "Recalling",
	Recalling_also = "Recalling also",
	Recognizing = "Recognizing",
	Recognizing_also = "Recognizing also",
	Recognizing_with_satisfaction = "Recognizing with satisfaction",
	Referring = "Referring",
	Regretting = "Regretting",
	Reiterating = "Reiterating",
	Reiterating_its_call_for = "Reiterating its call for",
	Reminding = "Reminding",
	Seeking = "Seeking",
	Seized = "Seized",
	Stressing = "Stressing",
	Taking_into_account = "Taking into account",
	Taking_into_consideration = "Taking into consideration",
	Taking_note = "Taking note",
	Taking_note_also = "Taking note also",
	Taking_note_further = "Taking note further",
	Underlining = "Underlining",
	Viewing_with_appreciation = "Viewing with appreciation",
	Viewing_with_apprehension = "Viewing with apprehension",
	Welcoming = "Welcoming",
	Welcoming_also = "Welcoming also",
}

export enum OperativePhrases {
	Accepts = "Accepts",
	Acknowledges = "Acknowledges",
	Adopts = "Adopts",
	Advises = "Advises",
	Affirms = "Affirms",
	Also_calls_for = "Also calls for",
	Also_recommends = "Also recommends",
	Also_strongly_condemns = "Also strongly condemns",
	Also_urges = "Also urges",
	Appeals = "Appeals",
	Appreciates = "Appreciates",
	Approves = "Approves",
	Authorizes = "Authorizes",
	Calls = "Calls",
	Calls_for = "Calls for",
	Calls_upon = "Calls upon",
	Commends = "Commends",
	Concurs = "Concurs",
	Condemns = "Condemns",
	Confirms = "Confirms",
	Congratulates = "Congratulates",
	Considers = "Considers",
	Decides = "Decides",
	Declares = "Declares",
	Declares_accordingly = "Declares accordingly",
	Demands = "Demands",
	Deplores = "Deplores",
	Designates = "Designates",
	Directs = "Directs",
	Draws_the_attention = "Draws the attention",
	Emphasizes = "Emphasizes",
	Encourages = "Encourages",
	Endorses = "Endorses",
	Expresses_its_appreciation = "Expresses its appreciation",
	Expresses_its_hope = "Expresses its hope",
	Expresses_its_regret = "Expresses its regret",
	Further_invites = "Further invites",
	Further_proclaims = "Further proclaims",
	Further_recommends = "Further recommends",
	Further_reminds = "Further reminds",
	Further_requests = "Further requests",
	Further_resolves = "Further resolves",
	Has_resolved = "Has resolved",
	Instructs = "Instructs",
	Introduces = "Introduces",
	Invites = "Invites",
	Notes = "Notes",
	Notes_with_satisfaction = "Notes with satisfaction",
	Proclaims = "Proclaims",
	Reaffirms = "Reaffirms",
	Recalls = "Recalls",
	Recognizes = "Recognizes",
	Recommends = "Recommends",
	Regrets = "Regrets",
	Reiterates = "Reiterates",
	Reminds = "Reminds",
	Renews_its_appeal = "Renews its appeal",
	Repeats = "Repeats",
	Requests = "Requests",
	Requires = "Requires",
	Solemnly_affirms = "Solemnly affirms",
	Stresses = "Stresses",
	Strongly_advises = "Strongly advises",
	Strongly_condemns = "Strongly condemns",
	Strongly_encourages = "Strongly encourages",
	Suggests = "Suggests",
	Supports = "Supports",
	Takes_note_of = "Takes note of",
	Transmits = "Transmits",
	Trusts = "Trusts",
	Underlines = "Underlines",
	Underscores = "Underscores",
	Urges = "Urges",
	Welcomes = "Welcomes",
}

export type ClauseType = "preambulatory" | "operative";

export interface ClauseBase {
	id: string;
	index: number;
	startingPhrase: string;
	body: string;
	resolutionId: string;
}

export interface SubSubClause {
	content: string;
}

export interface SubClause {
	content: string;
	subSubClauses: SubSubClause[];
}

export interface Clause extends ClauseBase {
	subClauses: SubClause[];
}

export interface ClauseUpdateEvent {
	type: ClauseType;
	clause: Clause;
	updateType: "edit" | "reorder" | "delete" | "add";
	index?: number;
}

export interface SubClauseUpdateEvent extends ClauseUpdateEvent {
	subClauseIndex: number;
}

export interface SubSubClauseUpdateEvent extends SubClauseUpdateEvent {
	subSubClauseIndex: number;
}
