const calculatePriceChange = (oldPrice, newPrice) => {


    const priceChange = newPrice - oldPrice;
    const direction = priceChange > 0 ? '+' : '';

    return `${direction}${priceChange}`;
}

module.exports = {
    calculatePriceChange
}
