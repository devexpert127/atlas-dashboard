export async function getPriceWithTokenAddress(
  mintAddress: string
) {
  return await fetch("https://price-api.sonar.watch/prices")
  .then(res => res.json())
  .then(
    (result: any[]) => {
      const token = result.find(value => value.mint === mintAddress);
      if (token)
        return token.price;
      return 0;
    },
    (error) => {
      console.log('error');
      return 0;
    }
  );
}