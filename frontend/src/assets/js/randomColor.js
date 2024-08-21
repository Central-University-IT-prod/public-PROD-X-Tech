const colors = [
    {
        color: "#0068ff",
        background: "#272a35",
    },
    {
        color: "#ee0177",
        background: "#50062b",
    },
    {
        color: "#ea951b",
        background: "#332b1e",
    },
    {
        color: "#00ac8c",
        background: "#052d25",
    },
];

export default function randomColor(count = 1) {
    const shuffled = colors.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, count);
}
