const Contract = () => {
    const moduleAddress = '0x8def2b80047ca891956df00075de15fa732b3030273ea1165ab4921169b36400';
    const moduleName = 'amethyst_mine';
    const cedraUrl = 'https://testnet.cedra.dev/v1';
    const get = async (fn, argument = []) => {
        const payload = {
            function: `${moduleAddress}::${moduleName}::${fn}`,
            type_arguments: [],
            arguments: [moduleAddress, ...argument],
        };
        const result = await fetch(`${cedraUrl}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return result.json();
    };
    return { get };
};
export default Contract;
