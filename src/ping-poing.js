/* Original code: https://github.com/wwwtyro/space-2d */

export function pingPong({
  initialFramebuffer,
  alphaFramebuffer,
  betaFramebuffer,
  count,
  func,
}) {
  // Bail if the render count is zero.
  if (count === 0) return initial;
  // Make sure the initial FBO is not the same as the first
  // output FBO.
  if (initialFramebuffer === alphaFramebuffer) {
    alphaFramebuffer = betaFramebuffer;
    betaFramebuffer = initialFramebuffer;
  }
  // Render to alpha using initial as the source.
  func(initialFramebuffer, alphaFramebuffer);
  // Keep track of how many times we've rendered. Currently one.
  let i = 1;
  // If there's only one render, we're already done.
  if (i === count) return alphaFramebuffer;
  // Keep going until we reach our render count.
  while (true) {
    // Render to beta using alpha as the source.
    func(alphaFramebuffer, betaFramebuffer);
    // If we've hit our count, we're done.
    i++;
    if (i === count) return betaFramebuffer;
    // Render to alpha using beta as the source.
    func(betaFramebuffer, alphaFramebuffer);
    // If we've hit our count, we're done.
    i++;
    if (i === count) return alphaFramebuffer;
  }
}
