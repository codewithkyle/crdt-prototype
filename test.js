const diff = require("./diff");
ops = [
    ...diff(
        {
            uid: "14d48ba7-b2ec-4aa1-a079-6ea351450ed1",
            weight: 100,
            name: "Apple",
            type: "honeycrisp",
            bruises: [
                {
                    id: 1,
                    shape: "circle"
                },
                {
                    id: 2,
                    shape: "square"
                },
            ],
            subtype: {},
            arrayDiff: ["slot 1"],
            arrayUpdate: ["slot 1"],
        },
        {
            uid: "14d48ba7-b2ec-4aa1-a079-6ea351450ed1",
            weight: 120,
            name: "Apple",
            type: "honeycrisp",
            bruises: [
                {
                    id: 1,
                    shape: "oval"
                },
                {
                    id: 2,
                    shape: "square"
                },
            ],
            subtype: {
                type: "test 2",
                deep: {
                    yep: "we are deep"
                }
            },
            arrayDiff: ["slot 1", "slot 2"],
            arrayUpdate: ["slot 0"],
        },
        "exmaples",
        "uuid-v4-placeholder"
    )
];
console.log(ops);