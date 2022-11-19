export const parseError = (error: any) => {
  error = error[0] || error
  let msg = error?.body?.error || error?.message || error?.msg || error
  msg = msg.replaceAll('(', '\\(').replaceAll(')', '\\)')
  return msg
}
