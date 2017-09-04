declare namespace Beetlejuice {
	interface A {
		"string": string;
		"number": number;
		"object": { "netedString": string;
"nestedNumber": number;
 };
		"arrayValue": { "a": string;
 }[];
	}
}
export = Beetlejuice;