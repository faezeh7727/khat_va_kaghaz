const persianNumberFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

export default function numberFormatter(value = 0) {
  const numericValue = Number(value);
  return persianNumberFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}
