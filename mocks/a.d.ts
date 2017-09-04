declare namespace Beetlejuice {
	interface A {
		"string": string;
		"number": number;
		"object": {
			"netedString": string;
			"nestedNumber": number;
		};
		"array": {
			"0": string;
			"1": string;
			"2": string;
		};
	}
}
export = Beetlejuice;