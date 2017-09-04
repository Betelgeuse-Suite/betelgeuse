declare namespace Beetlejuice {
	interface B {
		"string2": string;
		"number2": number;
		"object2": {
			"netedString": string;
			"nestedNumber": number;
		};
		"array2": {
			"0": string;
			"1": string;
			"2": string;
		};
	}
}
export = Beetlejuice;