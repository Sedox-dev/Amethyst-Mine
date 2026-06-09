const ConvertToGrid = (gridString) => {
    return gridString.split('/').map((rowStr) => {
        const row = [];
        let i = 0;
        while (i < rowStr.length) {
            const char = rowStr[i];
            if (char >= 'A' && char <= 'Z') {
                const tens = char.charCodeAt(0) - 64;
                const units = parseInt(rowStr[i + 1], 10);
                row.push(tens * 10 + units);
                i += 2;
            }
            else {
                row.push(parseInt(char, 10));
                i += 1;
            }
        }
        return row;
    });
};
export default ConvertToGrid;
