declare namespace Beetlejuice {
	interface Prev {
		"id": string;
		"array": {i: string, a: number}[];
		"index": {
			"notReadyToAdd": string;
			"notReadyToCheckout": string;
			"new_prop": string;
		};
		"payments": {
			"credit_cards": {
				"limitedTypes": string;
				"successfullyCreated": string;
				"successfullyUpdated": string;
			};
		};
		"funding": {
			"ACH": {
				"confirmRequest": string;
				"requestSuccess": string;
			};
			"bank_accounts": {
				"checkings": {
					"onBoarding": {
						"phoneVerificationPrompt": string;
						"phoneVerificationSuccess": string;
					};
					"onLeaving": {
						"phone": string;
						"tv": string;
					};
				};
				"savings": {
					"processing": string;
					"completed": string;
				};
			};
		};
	}
}

export = Beetlejuice;
