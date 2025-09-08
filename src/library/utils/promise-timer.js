export async function timer(label, promise) {
  const start = performance.now();
  console.log('starting', label);

  const result = await promise;

  const end = performance.now();
  const seconds = ((end - start) / 1000).toFixed(2);
  console.log(label, `took ${seconds} s`);
  return result;
}
