export const attrs = ({
  className,
  style
}: Readonly<{
  className?: string | undefined;
  style?: { [key: string]: string | number };
}>) => {
  const result: { class?: string; style?: string } = {}
  if (className != null) {
    result.class = className
  }
  if (style != null) {
    result.style = Object.entries(style)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
  }
  return result
}
